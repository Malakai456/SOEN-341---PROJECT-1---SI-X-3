import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

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

// Create a ticket: server mints secure token, saves row, returns details for QR
app.post("/api/purchase", async (req, res) => {
  try {
    const {
      userId,                // required
      eventId,               // optional; we can resolve if not provided
      eventName, eventDate,  // optional (used to resolve eventId)
      eventTime, eventLocation, eventPrice, eventImage
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // If client didn't send eventId, find by title & DATE(starts_at)
    let resolvedEventId = eventId;
    if (!resolvedEventId && eventName && eventDate) {
      const [ev] = await db.query(
        "SELECT event_id FROM events WHERE title = ? AND DATE(starts_at) = ? LIMIT 1",
        [eventName, eventDate]
      );
      if (ev.length) resolvedEventId = ev[0].event_id;
    }

    // Create minimal event row ifnotfound so we can issue the ticket
    if (!resolvedEventId) {
      const starts = eventDate ? `${eventDate} 00:00:00` : new Date().toISOString().slice(0,19).replace('T',' ');
      const ends   = eventDate ? `${eventDate} 23:59:59` : starts;
      const [insEv] = await db.query(
        "INSERT INTO events (title, description, starts_at, ends_at, capacity, ticket_policy) VALUES (?, ?, ?, ?, ?, 'free')",
        [eventName || 'Untitled', eventLocation || null, starts, ends, 999]
      );
      resolvedEventId = insEv.insertId;
    }

    // Enforce 1 ticket per user/event 
    const [existing] = await db.query(
      "SELECT ticket_id, qr_code_value FROM tickets WHERE user_id=? AND event_id=? LIMIT 1",
      [userId, resolvedEventId]
    );
    if (existing.length) {
      const token = existing[0].qr_code_value;
      const ticketUrl = `${req.protocol}://${req.get("host")}/ticket/verify?token=${encodeURIComponent(token)}`;
      return res.json({
        ticketId: existing[0].ticket_id,
        token,
        ticketUrl,
        eventId: resolvedEventId,
        eventName, eventDate, eventTime, eventLocation, eventPrice, eventImage
      });
    }

    // Secure token for QR (server)
    const token = crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");

    // Insert the ticket row
    const [ins] = await db.query(
      "INSERT INTO tickets (event_id, user_id, qr_code_value, status) VALUES (?, ?, ?, 'issued')",
      [resolvedEventId, userId, token]
    );

    const ticketId = ins.insertId;
    const ticketUrl = `${req.protocol}://${req.get("host")}/ticket/verify?token=${encodeURIComponent(token)}`;

    // Return everything the front-end needs
    return res.json({
      ticketId,
      token,
      ticketUrl,
      eventId: resolvedEventId,
      eventName, eventDate, eventTime, eventLocation, eventPrice, eventImage
    });
  } catch (err) {
    console.error("purchase error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Verify page (non-static html way): checks DB by token, shows Approved/Invalid
app.get("/ticket/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");

    const [rows] = await db.query(
      `SELECT t.ticket_id, t.status, u.first_name, u.last_name,
              e.title AS event_name, e.starts_at
       FROM tickets t
       JOIN users  u ON u.user_id = t.user_id
       JOIN events e ON e.event_id = t.event_id
       WHERE t.qr_code_value = ?
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.status(404).send(`<!doctype html><html><body style="font-family:Arial">
        <main style="max-width:860px;margin:28px auto">
          <h1>Invalid Ticket!</h1>
          <p>Token not found.</p>
        </main></body></html>`);
    }

    const t = rows[0];
    if (t.status !== "issued") {
      return res.status(400).send(`<!doctype html><html><body style="font-family:Arial">
        <main style="max-width:860px;margin:28px auto">
          <h1>Oh No, Ticket Not Valid...</h1>
          <p>Status: ${t.status}</p>
        </main></body></html>`);
    }

    const start = t.starts_at instanceof Date
      ? t.starts_at.toISOString().replace('T',' ').slice(0,16)
      : (t.starts_at || '');

    return res.send(`<!doctype html><html><body style="font-family:Arial">
      <main style="max-width:860px;margin:28px auto">
        <h1>Yay, Ticket Approved!</h1>
        <p><strong>Holder:</strong> ${t.first_name || ''} ${t.last_name || ''}</p>
        <p><strong>Ticket ID:</strong> ${t.ticket_id}</p>
        <p><strong>Event:</strong> ${t.event_name}</p>
        <p><strong>Starts at:</strong> ${start}</p>
      </main></body></html>`);
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).send("Server error");
  }
});

// 📨 CONTACT FORM ROUTE
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all fields.",
      });
    }

    console.log("📩 New contact submission:", { name, email, subject, message });

    // Save message to database
    await db.query(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );

    res.status(200).json({
      success: true,
      message: "Message saved successfully!",
    });
  } catch (error) {
    console.error("❌ Error saving contact form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


// --- Start server ---
app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
