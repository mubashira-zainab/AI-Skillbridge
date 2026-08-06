// config/db.js
// Sets up the SQLite database connection and creates tables if they don't exist yet.

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data", "skillbridge.db");
const db = new Database(dbPath);

// Better performance + safety defaults
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- USERS ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    education TEXT,
    skills TEXT,      -- comma-separated, e.g. "HTML,CSS,Python"
    interests TEXT,   -- comma-separated, e.g. "AI,Web Development"
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// ---------- CAREERS ----------
// Each career has a set of required skills. We compare the user's
// skills against this list to compute match %, gaps, and roadmap.
db.exec(`
  CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    required_skills TEXT NOT NULL -- comma-separated, ordered = roadmap order
  )
`);

// ---------- JOBS ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    required_skills TEXT NOT NULL -- comma-separated
  )
`);

module.exports = db;
