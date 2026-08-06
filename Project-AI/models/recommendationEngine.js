// models/recommendationEngine.js
//
// AI-powered recommendation engine. Takes a user's subject/skills/interests
// and asks Claude to generate career matches, skill gaps, a learning
// roadmap, and job recommendations — works for ANY subject, not just a
// fixed list.
//
// Requires ANTHROPIC_API_KEY to be set in the environment.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You are a career guidance assistant inside an app called AI SkillBridge.
Given a user's subject/field, self-reported skills, and interests, you generate realistic
career guidance data.

Respond ONLY with valid JSON (no markdown fences, no preamble, no explanation) in exactly
this shape:

{
  "careerMatch": {
    "topCareer": "string - best matching career title",
    "matchPercent": number (0-100, how well their current skills match the top career),
    "allMatches": [
      {
        "career": "string",
        "matchPercent": number (0-100),
        "skillsHave": ["string", ...],
        "skillsMissing": ["string", ...]
      }
    ]
  },
  "skillsCompleted": "string like '3 / 7'",
  "skillGap": {
    "have": ["string", ...],
    "missing": ["string", ...]
  },
  "roadmap": [
    { "skill": "string", "status": "completed" | "in_progress" | "pending" }
  ],
  "jobMatches": [
    { "title": "string", "company": "string - realistic company for this field", "matchPercent": number (0-100) }
  ]
}

allMatches must have exactly 3 items sorted by matchPercent descending. jobMatches must have
3-5 realistic job postings for this field. Be realistic and specific to the given subject/field,
whatever it is (tech, business, healthcare, design, education, trades, etc). Base matchPercent
on genuine overlap between what they have and what the role needs. Do not include any text
outside the JSON object.`;

async function callClaude(userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text content returned from Claude API.");

  // Defensive: strip accidental markdown fences if the model adds them
  const cleaned = textBlock.text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Main entry point used by the dashboard route.
 * Returns everything the frontend dashboard needs in one shape.
 */
async function buildDashboard(user) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it in your hosting provider's environment variables."
    );
  }

  const skills = (user.skills || "").trim();
  const interests = (user.interests || "").trim();
  const education = (user.education || "").trim();

  const userPrompt = `User profile:
- Education/subject: ${education || "not specified"}
- Self-reported skills: ${skills || "none listed"}
- Interests: ${interests || "not specified"}

Generate the career guidance JSON for this user based on their subject/field above.`;

  const result = await callClaude(userPrompt);

  return {
    careerMatch: result.careerMatch,
    skillsCompleted: result.skillsCompleted,
    skillGap: result.skillGap,
    roadmap: result.roadmap,
    jobMatches: result.jobMatches,
  };
}

module.exports = { buildDashboard };
