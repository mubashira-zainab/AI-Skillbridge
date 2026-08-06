// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5500",
    credentials: true, // allow cookies to be sent from the frontend
  })
);
app.use(express.json());
app.use(cookieParser());

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI SkillBridge API is running." });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI SkillBridge API running on http://localhost:${PORT}`);
});
