const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Explicitly point to the /public folder
const publicPath = path.join(__dirname, "public");
console.log("🟩 Serving static files from:", publicPath);
app.use(express.static(publicPath));

// ✅ Database connection (MariaDB on port 3307)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 3307,
  password: "",
  database: "341_project"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MariaDB (341_project)");
  }
});

// ✅ Registration endpoint
app.post("/register", (req, res) => {
  const { firstname, lastname, username, password, phone, email, address } = req.body;

  if (!firstname || !lastname || !username || !password || !email) {
    return res.status(400).send("Missing required fields");
  }

  const sql = `
    INSERT INTO users (first_name, last_name, username, password, phone, email, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [firstname, lastname, username, password, phone, email, address], (err) => {
    if (err) {
      console.error("❌ Insert error:", err);
      return res.status(500).send("Database insert failed");
    }
    console.log("✅ User added successfully");
    res.status(200).send("User registered successfully");
  });
});

// ✅ Launch the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
