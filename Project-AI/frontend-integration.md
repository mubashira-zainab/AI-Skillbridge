# Connecting your existing frontend to this backend

Add these as new files in your frontend folder, then reference with a
`<script>` tag. No changes needed to your HTML structure or CSS.

## 1. Create `frontend/api.js`

```javascript
const API_BASE = "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // sends the httpOnly auth cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
```

## 2. Signup — add before `</body>` in `signup.html`

```html
<script src="api.js"></script>
<script>
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll("input");
    const [name, email, education, skills, interests, password] = inputs;

    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          education: education.value,
          skills: skills.value,
          interests: interests.value,
          password: password.value,
        }),
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      alert(err.message);
    }
  });
</script>
```

## 3. Login — add before `</body>` in `login.html`

```html
<script src="api.js"></script>
<script>
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const [email, password] = e.target.querySelectorAll("input");

    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.value, password: password.value }),
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      alert(err.message);
    }
  });
</script>
```

## 4. Dashboard — replace hardcoded content dynamically

Add `id` attributes to the elements you want to fill in `dashboard.html`
(e.g. `<p id="matchPercent">85%</p>`), then:

```html
<script src="api.js"></script>
<script>
  (async () => {
    try {
      const data = await apiRequest("/dashboard");

      document.querySelector("header p").textContent = `Welcome back, ${data.name}! 👋`;
      document.getElementById("matchPercent").textContent = `${data.careerMatch.matchPercent}%`;
      document.getElementById("skillsCompleted").textContent = data.skillsCompleted;

      // Example: render job matches into a <ul id="jobList">
      const jobList = document.getElementById("jobList");
      jobList.innerHTML = data.jobMatches
        .map((j) => `<li>💻 ${j.title} - ${j.company} (${j.matchPercent}% match)</li>`)
        .join("");

      // Example: render roadmap into an <ol id="roadmapList">
      const roadmapList = document.getElementById("roadmapList");
      roadmapList.innerHTML = data.roadmap
        .map((s) => {
          const icon = s.status === "completed" ? "✅" : s.status === "in_progress" ? "⏳" : "⏳";
          return `<li>${icon} ${s.skill}</li>`;
        })
        .join("");
    } catch (err) {
      // Not logged in -> send back to login
      window.location.href = "login.html";
    }
  })();
</script>
```

## 5. Logout — update the Logout link

```html
<a href="#" id="logoutLink">Logout</a>
<script>
  document.getElementById("logoutLink").addEventListener("click", async (e) => {
    e.preventDefault();
    await apiRequest("/auth/logout", { method: "POST" });
    window.location.href = "login.html";
  });
</script>
```

## Notes
- Update `API_BASE` in `api.js` once you deploy the backend somewhere other than localhost.
- If you serve the frontend as plain files (not through a dev server), open it via `http://localhost:5500` (e.g. VS Code Live Server) rather than `file://`, and make sure `FRONTEND_URL` in the backend `.env` matches that origin — cookies won't work over `file://`.
