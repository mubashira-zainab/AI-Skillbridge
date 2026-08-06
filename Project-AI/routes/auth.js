// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { pool } = require("../config/db");

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // cookies with sameSite:"none" require secure:true, which requires HTTPS
  sameSite: isProd ? "none" : "lax", // "none" only works over HTTPS (deployed); "lax" works on localhost
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// ---------- SIGNUP ----------
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("education").optional().trim(),
    body("skills").optional().trim(),
    body("interests").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, email, password, education = "", skills = "", interests = "" } = req.body;

      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }

      const password_hash = bcrypt.hashSync(password, 10);

      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, education, skills, interests)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, email, password_hash, education, skills, interests]
      );

      const user = result.rows[0];
      const token = signToken(user);

      res.cookie("token", token, COOKIE_OPTIONS);
      res.status(201).json({ user: publicUser(user), token });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- LOGIN ----------
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = signToken(user);
      res.cookie("token", token, COOKIE_OPTIONS);
      res.json({ user: publicUser(user), token });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- LOGOUT ----------
router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully." });
});

module.exports = router;