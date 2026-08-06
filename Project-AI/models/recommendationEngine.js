// models/recommendationEngine.js
//
// Rule-based recommendation engine. Takes a user's skills and compares them
// against career/job requirement lists stored in the database.
// This can later be swapped out for a real LLM call without changing
// the API shape that the frontend consumes.

const db = require("../config/db");

/** Turn "HTML, css , Python" into ["html","css","python"] (trimmed, lowercased) */
function normalizeSkillList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Turn back into a nicely-cased display list using the original casing from `source` */
function displayCase(skill, referenceList) {
  const match = referenceList.find((s) => s.toLowerCase() === skill.toLowerCase());
  return match || skill;
}

function getCareerMatches(userSkills) {
  const userSet = normalizeSkillList(userSkills.join(","));
  const careers = db.prepare("SELECT * FROM careers").all();

  const matches = careers.map((career) => {
    const required = normalizeSkillList(career.required_skills);
    const requiredDisplay = career.required_skills.split(",").map((s) => s.trim());

    const have = required.filter((skill) => userSet.includes(skill));
    const missing = required.filter((skill) => !userSet.includes(skill));

    const matchPercent = required.length
      ? Math.round((have.length / required.length) * 100)
      : 0;

    return {
      career: career.title,
      matchPercent,
      skillsHave: have.map((s) => displayCase(s, requiredDisplay)),
      skillsMissing: missing.map((s) => displayCase(s, requiredDisplay)),
    };
  });

  // Best matches first
  matches.sort((a, b) => b.matchPercent - a.matchPercent);
  return matches;
}

function getSkillGap(userSkills, topCareer) {
  if (!topCareer) return { have: userSkills, missing: [] };
  return {
    have: topCareer.skillsHave,
    missing: topCareer.skillsMissing,
  };
}

function getRoadmap(topCareer) {
  if (!topCareer) return [];
  // "Have" items marked complete, "missing" items marked in-progress/pending in order
  const steps = [
    ...topCareer.skillsHave.map((skill) => ({ skill, status: "completed" })),
    ...topCareer.skillsMissing.map((skill, i) => ({
      skill,
      status: i === 0 ? "in_progress" : "pending",
    })),
  ];
  return steps;
}

function getJobMatches(userSkills, limit = 5) {
  const userSet = normalizeSkillList(userSkills.join(","));
  const jobs = db.prepare("SELECT * FROM jobs").all();

  const scored = jobs.map((job) => {
    const required = normalizeSkillList(job.required_skills);
    const overlap = required.filter((skill) => userSet.includes(skill));
    const score = required.length ? overlap.length / required.length : 0;
    return {
      title: job.title,
      company: job.company,
      matchPercent: Math.round(score * 100),
    };
  });

  return scored
    .filter((j) => j.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

/**
 * Main entry point used by the dashboard route.
 * Returns everything the frontend dashboard needs in one shape.
 */
function buildDashboard(user) {
  const userSkills = normalizeSkillList(user.skills).length
    ? user.skills.split(",").map((s) => s.trim())
    : [];

  const careerMatches = getCareerMatches(userSkills);
  const topCareer = careerMatches[0] || null;
  const skillGap = getSkillGap(userSkills, topCareer);
  const roadmap = getRoadmap(topCareer);
  const jobMatches = getJobMatches(userSkills);

  const completed = roadmap.filter((s) => s.status === "completed").length;

  return {
    careerMatch: {
      topCareer: topCareer ? topCareer.career : null,
      matchPercent: topCareer ? topCareer.matchPercent : 0,
      allMatches: careerMatches.slice(0, 3), // top 3 recommendations
    },
    skillsCompleted: `${completed} / ${roadmap.length}`,
    skillGap,
    roadmap,
    jobMatches,
  };
}

module.exports = { buildDashboard, getCareerMatches, getJobMatches };
