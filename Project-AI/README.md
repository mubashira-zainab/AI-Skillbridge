# AI SkillBridge — Backend

Node.js + Express + SQLite backend for the AI SkillBridge career-guidance frontend.

## Setup

```bash
cd backend
npm install
cp .env.example .env       # then edit JWT_SECRET to something random
npm run seed                # populates careers & jobs reference data
npm start                   # or `npm run dev` for auto-restart on changes
```

Server runs at `http://localhost:5000` by default.

## Folder structure

```
backend/
  server.js               # app entry point
  config/db.js             # SQLite connection + table creation
  models/recommendationEngine.js  # the "AI" logic (rule-based skill matching)
  routes/auth.js           # signup / login / logout
  routes/profile.js        # get/update profile
  routes/dashboard.js      # career match, skill gap, roadmap, job matches
  middleware/auth.js       # JWT verification
  data/seed.js              # seeds careers + jobs tables
  data/skillbridge.db       # SQLite database file (created on first run)
```

## API Endpoints

### Auth
| Method | Endpoint            | Body                                                              | Notes                        |
|--------|----------------------|--------------------------------------------------------------------|-------------------------------|
| POST   | `/api/auth/signup`   | `{ name, email, password, education, skills, interests }`         | `skills`/`interests` comma-separated strings, e.g. `"HTML,CSS,Python"` |
| POST   | `/api/auth/login`    | `{ email, password }`                                              | Sets httpOnly cookie + returns token |
| POST   | `/api/auth/logout`   | —                                                                   | Clears cookie                 |

### Profile (requires auth)
| Method | Endpoint         | Body                                              |
|--------|-------------------|----------------------------------------------------|
| GET    | `/api/profile`    | —                                                  |
| PUT    | `/api/profile`    | `{ name, education, skills, interests }` (any subset) |

### Dashboard (requires auth)
| Method | Endpoint          | Returns                                                                 |
|--------|--------------------|--------------------------------------------------------------------------|
| GET    | `/api/dashboard`  | `{ name, careerMatch, skillsCompleted, skillGap, roadmap, jobMatches }` |

Example response:
```json
{
  "name": "Ayesha Khan",
  "careerMatch": {
    "topCareer": "Frontend Developer",
    "matchPercent": 50,
    "allMatches": [
      { "career": "Frontend Developer", "matchPercent": 50, "skillsHave": ["HTML","CSS"], "skillsMissing": ["JavaScript","React.js","Git & GitHub","Responsive Design"] }
    ]
  },
  "skillsCompleted": "2 / 6",
  "skillGap": { "have": ["HTML","CSS"], "missing": ["JavaScript","React.js","Git & GitHub","Responsive Design"] },
  "roadmap": [
    { "skill": "HTML", "status": "completed" },
    { "skill": "CSS", "status": "completed" },
    { "skill": "JavaScript", "status": "in_progress" },
    { "skill": "React.js", "status": "pending" }
  ],
  "jobMatches": [
    { "title": "Junior Frontend Developer", "company": "Google", "matchPercent": 50 }
  ]
}
```

## How the "AI" recommendation works

`models/recommendationEngine.js` compares the user's comma-separated `skills`
against required-skill lists for each career/job stored in the `careers` and
`jobs` tables (seeded via `npm run seed`). It computes:

- **Career match %** — overlap between user skills and each career's required skills
- **Skill gap** — required skills the user doesn't have yet
- **Roadmap** — has skills marked completed, missing skills queued in order
- **Job matches** — jobs ranked by skill overlap

This is intentionally rule-based so it works with zero external cost. You can
later swap `buildDashboard()` to call an LLM API for smarter, freeform
recommendations without changing the API response shape the frontend expects.

## Connecting the existing frontend

The frontend forms currently have no `action`/JS. To use this backend, add a
`<script>` to `signup.html`, `login.html`, and `dashboard.html` that calls
`fetch()` against these endpoints. See `frontend-integration.md` for exact
snippets.
