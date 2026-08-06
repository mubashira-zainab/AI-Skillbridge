// data/seed.js
// Populates the careers and jobs tables with starter reference data.
// Run once with: npm run seed

const db = require("../config/db");

const careers = [
  {
    title: "Frontend Developer",
    required_skills: "HTML,CSS,JavaScript,React.js,Git & GitHub,Responsive Design",
  },
  {
    title: "Backend Developer",
    required_skills: "JavaScript,Node.js,Express,SQL,Git & GitHub,REST APIs",
  },
  {
    title: "Full Stack Developer",
    required_skills:
      "HTML,CSS,JavaScript,React.js,Node.js,SQL,Git & GitHub,REST APIs",
  },
  {
    title: "Data Analyst",
    required_skills: "Python,SQL,Excel,Data Visualization,Statistics",
  },
  {
    title: "Machine Learning Engineer",
    required_skills: "Python,Statistics,Machine Learning,SQL,Git & GitHub",
  },
  {
    title: "UI/UX Designer",
    required_skills: "Figma,UI Design,UX Research,Prototyping,HTML,CSS",
  },
];

const jobs = [
  { title: "Junior Frontend Developer", company: "Google", required_skills: "HTML,CSS,JavaScript,React.js" },
  { title: "Web Developer Intern", company: "Microsoft", required_skills: "HTML,CSS,JavaScript" },
  { title: "React Developer", company: "Amazon", required_skills: "JavaScript,React.js,Git & GitHub" },
  { title: "Backend Engineer", company: "Netflix", required_skills: "Node.js,SQL,REST APIs" },
  { title: "Full Stack Engineer", company: "Meta", required_skills: "React.js,Node.js,SQL" },
  { title: "Data Analyst", company: "Spotify", required_skills: "Python,SQL,Data Visualization" },
  { title: "ML Engineer Intern", company: "OpenAI", required_skills: "Python,Machine Learning,Statistics" },
  { title: "UI/UX Designer", company: "Adobe", required_skills: "Figma,UI Design,Prototyping" },
];

const insertCareer = db.prepare(
  `INSERT OR IGNORE INTO careers (title, required_skills) VALUES (@title, @required_skills)`
);
const insertJob = db.prepare(
  `INSERT INTO jobs (title, company, required_skills) VALUES (@title, @company, @required_skills)`
);

const seed = db.transaction(() => {
  // Clear jobs so re-running the seed doesn't duplicate them
  db.exec("DELETE FROM jobs");
  careers.forEach((c) => insertCareer.run(c));
  jobs.forEach((j) => insertJob.run(j));
});

seed();

console.log(`Seeded ${careers.length} careers and ${jobs.length} jobs.`);
