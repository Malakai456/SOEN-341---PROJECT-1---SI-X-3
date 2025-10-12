import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Get directory path for static files (like events.html)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// --- Database connection ---
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "341_project_SARAH",
});

// --- Google OAuth2 setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Redirect user to Google sign-in
app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
  res.redirect(url);
});

// Handle Google OAuth callback
app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save access & refresh tokens in DB
    await db.query(
      "UPDATE users SET google_access_token=?, google_refresh_token=? WHERE user_id=?",
      [tokens.access_token, tokens.refresh_token, 1]
    );

    res.redirect("/events.html?connected=true");
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).send("Failed to connect Google account.");
  }
});

// Add event to Google Calendar when user buys
app.post("/api/buy", async (req, res) => {
  try {
    const { title, description, starts_at, ends_at, location } = req.body;

    // Get user’s saved tokens
    const [users] = await db.query(
      "SELECT google_access_token, google_refresh_token FROM users WHERE user_id=?",
      [1]
    );
    if (!users.length)
      return res.status(401).json({ message: "User not authenticated" });

    const { google_access_token, google_refresh_token } = users[0];
    oauth2Client.setCredentials({
      access_token: google_access_token,
      refresh_token: google_refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description,
      location,
      start: { dateTime: starts_at, timeZone: "America/Toronto" },
      end: { dateTime: ends_at, timeZone: "America/Toronto" },
    };

    await calendar.events.insert({ calendarId: "primary", resource: event });
    res.json({ message: "Event added successfully" });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Start server ---
app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
