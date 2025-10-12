const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// DB (XAMPP MariaDB)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 3307,              // <- your MariaDB port
  password: "",
  database: "341_project", // <- your DB
});

db.connect((err) => {
  if (err) console.error("❌ DB connection failed:", err);
  else console.log("✅ Connected to MariaDB (341_project)");
});

// ---------- REGISTER (kept simple) ----------
app.post("/register", (req, res) => {
  const { firstname, lastname, username, password, phone, email, address } = req.body;
  if (!firstname || !lastname || !username || !password || !email)
    return res.status(400).send("Missing required fields");

  const sql = `
    INSERT INTO users (first_name, last_name, username, password, phone, email, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [firstname, lastname, username, password, phone, email, address], (err) => {
    if (err) return res.status(500).send("Database insert failed");
    res.status(200).send("User registered successfully");
  });
});

// ---------- LOGIN (barebones; returns user_id + username) ----------
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing credentials");

  const sql = "SELECT user_id, username FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).send("Database error");
    }
    if (results.length === 0) return res.status(401).send("Invalid username or password");

    res.json({ message: "Login successful", user: results[0] });
  });
});

// ---------- BUY (pretend login via localStorage; insert into event_buys) ----------
app.post("/buy", (req, res) => {
  let { user_id, event_id } = req.body;

  user_id  = Number(user_id);
  event_id = Number(event_id);
  if (!user_id || !event_id) return res.status(400).send("Invalid payload");

  // NOTE: `time` is a reserved-ish word; quote it with backticks
  const sql = "INSERT INTO event_buys (user_id, event_id, `time`) VALUES (?, ?, NOW())";

  db.query(sql, [user_id, event_id], (err) => {
    if (err) {
      console.error("❌ /buy SQL error:", err.code, err.sqlMessage);
      return res.status(500).send("Database error");
    }
    res.status(200).json({ ok: true, message: "Purchase recorded" });
  });
});


// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
