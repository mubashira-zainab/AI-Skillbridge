// routes/profile.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// ---------- GET PROFILE ----------
router.get("/", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

// ---------- UPDATE PROFILE ----------
router.put(
  "/",
  requireAuth,
  [
    body("name").optional().trim().notEmpty(),
    body("education").optional().trim(),
    body("skills").optional().trim(),
    body("interests").optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const current = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!current) return res.status(404).json({ error: "User not found." });

    const { name, education, skills, interests } = req.body;

    db.prepare(
      `UPDATE users SET name = ?, education = ?, skills = ?, interests = ? WHERE id = ?`
    ).run(
      name ?? current.name,
      education ?? current.education,
      skills ?? current.skills,
      interests ?? current.interests,
      req.user.id
    );

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json({ user: publicUser(updated) });
  }
);

module.exports = router;
