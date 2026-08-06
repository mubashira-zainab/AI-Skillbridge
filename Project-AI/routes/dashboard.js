// routes/dashboard.js
const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { buildDashboard } = require("../models/recommendationEngine");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  try {
    const dashboard = await buildDashboard(user);
    res.json({
      name: user.name,
      ...dashboard,
    });
  } catch (err) {
    console.error("Dashboard AI generation failed:", err);
    res.status(500).json({ error: "Could not generate career recommendations right now." });
  }
});

module.exports = router;