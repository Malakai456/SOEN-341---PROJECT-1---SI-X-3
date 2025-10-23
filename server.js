// --- IMPORTS (ESM syntax) ---
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

// --- APP SETUP ---
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Server is running!"));

// --- DATABASE CONNECTION ---
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "341_PROJECT_SARAH",
});
console.log("Connected to MySQL database 341_PROJECT_SARAH");

// --- STATIC FILE SERVING ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// --- CREATE TICKET (the route that worked) ---
app.post("/api/purchase", async (req, res) => {
  try {
    const {
      userId,
      eventId,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventPrice,
      eventImage,
    } = req.body;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // Try to resolve eventId
    let resolvedEventId = eventId;
    if (!resolvedEventId && eventName && eventDate) {
      const [ev] = await db.query(
        "SELECT event_id FROM events WHERE title = ? AND DATE(starts_at) = ? LIMIT 1",
        [eventName, eventDate]
      );
      if (ev.length) resolvedEventId = ev[0].event_id;
    }

    // Create event if not found
    if (!resolvedEventId) {
      const starts = eventDate
        ? `${eventDate} 00:00:00`
        : new Date().toISOString().slice(0, 19).replace("T", " ");
      const ends = eventDate ? `${eventDate} 23:59:59` : starts;
      const [insEv] = await db.query(
        "INSERT INTO events (title, description, starts_at, ends_at, capacity, ticket_policy) VALUES (?, ?, ?, ?, ?, 'free')",
        [eventName || "Untitled", eventLocation || null, starts, ends, 999]
      );
      resolvedEventId = insEv.insertId;
    }

    // One ticket per user/event
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
        eventName,
        eventDate,
        eventTime,
        eventLocation,
        eventPrice,
        eventImage,
      });
    }

    // Create secure token
    const token = crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");

    // Insert ticket
    const [ins] = await db.query(
      "INSERT INTO tickets (event_id, user_id, qr_code_value, status) VALUES (?, ?, ?, 'issued')",
      [resolvedEventId, userId, token]
    );

    const ticketId = ins.insertId;
    const ticketUrl = `${req.protocol}://${req.get("host")}/ticket/verify?token=${encodeURIComponent(token)}`;

    return res.json({
      ticketId,
      token,
      ticketUrl,
      eventId: resolvedEventId,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventPrice,
      eventImage,
    });
  } catch (err) {
    console.error("purchase error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  VERIFY TICKET 
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
      return res.status(404).send(`<h1>Invalid Ticket!</h1>`);
    }

    const t = rows[0];
    if (t.status !== "issued") {
      return res.status(400).send(`<h1>Ticket Not Valid</h1>`);
    }

    res.send(`
      <h1>Ticket Approved</h1>
      <p><strong>Holder:</strong> ${t.first_name} ${t.last_name}</p>
      <p><strong>Event:</strong> ${t.event_name}</p>
      <p><strong>Starts at:</strong> ${t.starts_at}</p>
    `);
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).send("Server error");
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
