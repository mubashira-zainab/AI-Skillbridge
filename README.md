# 🎯 AI SkillBridge

**An AI-powered career guidance platform.** Users sign up with their education, skills, and interests, and get a personalized career match, skill gap analysis, learning roadmap, and job recommendations — powered by AI, so it works for *any* field, not just tech.

🔗 **[Live Website →](https://quiet-scone-cc5bdc.netlify.app)**
🔗 **[Backend API →](https://ai-skillbridge.onrender.com/api/health)**

> ⚠️ Hosted on free-tier infrastructure. The API may take ~50 seconds to wake up on the first request after inactivity.

---

## ✨ Features

- 🔐 **Secure authentication** — signup/login/logout with hashed passwords and JWT-based sessions
- 🤖 **AI career matching** — enter any subject or skillset and get a real, generated top-career match with a percentage fit
- 📊 **Skill gap analysis** — see exactly what you already have and what's missing for your target role
- 🗺️ **Personalized learning roadmap** — an ordered path from your current skills to your goal
- 💼 **Job recommendations** — realistic job matches based on your profile
- ⚡ Works for **any subject** — tech, business, healthcare, design, education, and more

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (static) |
| Backend | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |
| Auth | JWT + bcrypt |
| AI | Grok API (xAI) |
| Hosting | Netlify (frontend) · Render (backend) |

---

## 📁 Project Structure

```
Project-AI/
├── config/                 # Database setup
├── data/                   # Seed data
├── middleware/              # Auth middleware
├── models/
│   └── recommendationEngine.js   # AI-powered career/job matching
├── routes/
│   ├── auth.js
│   ├── dashboard.js
│   └── profile.js
├── index.html, login.html, signup.html,
│   dashboard.html, about.html, features.html
├── style.css
├── api.js                  # Frontend → backend API wrapper
└── server.js
```

---

## 🚀 Local Setup

### 1. Backend

```bash
cd Project-AI
npm install
cp .env.example .env      # set JWT_SECRET and XAI_API_KEY
npm run seed               # populate reference data
npm start
```
API runs at `http://localhost:5000`.

### 2. Frontend

Open the HTML files using a local dev server (e.g. VS Code's "Live Server" extension) — not by double-clicking the file. Cookies/auth require the page to be served over `http://`, not opened as `file://`.

By default the frontend expects the backend at `http://localhost:5000/api` (see `api.js`), and the backend expects the frontend at `http://localhost:5500` (see `FRONTEND_URL` in `.env`). Adjust either if your ports differ.

### Environment Variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `FRONTEND_URL` | URL of the deployed frontend (for CORS) |
| `XAI_API_KEY` | Grok (xAI) API key for AI-generated recommendations |
| `NODE_ENV` | `production` on live deployments |

---

## 🧪 Try It

1. Visit the [live site](https://quiet-scone-cc5bdc.netlify.app)
2. Sign up with any subject and skillset (e.g. `Marketing`, `Nursing`, `HTML, CSS, Python`)
3. View your AI-generated dashboard — career match, skill gap, roadmap, and job recommendations tailored to what you entered

---

## 👥 Contributors

- **Frontend design & development** — [@muqadaszainab77](https://github.com/muqadaszainab77)
  Designed and built the static frontend — all pages, layout, and styling.

- **Backend development, AI integration & deployment** — [@Rztech15](https://github.com/Rztech15)
  Built the full Node.js/Express/SQLite backend, integrated the AI-powered recommendation engine, and deployed the complete application (backend on Render, frontend on Netlify).

---

## 📄 License

MIT
