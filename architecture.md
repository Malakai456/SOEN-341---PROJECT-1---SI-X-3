# CampusEvents - Architecture - Block Diagram

## 1. System Architecture (Block Diagram)

Frontend (Client Side)
- User Pages: mainpage.html, events.html, calendar.html, ticket.html, login.html, register.html
- Organizer Pages: create_events.html, event_dashboard.html, loginOrganizer.html
- Admin Pages: admin.html, loginAdmin.html
- Shared Scripts: scripts.js, ticket.js, create_events.js, styles.css

Frontend uses fetch() to send requests to the backend and receive JSON responses.

Backend (Node.js / Express)
- File: server.js
- API Routes:
  /api/events               → get or add events
  /api/events/moderate      → admin moderation list
  /api/events/approve/:id   → approve event
  /api/events/delete/:id    → delete event
  /api/pending-organizers   → admin approval list
  /api/approve-organizer/:id→ approve organizer
  /api/event-analytics      → organizer dashboard (Chart.js)
  /api/admin/stats          → global statistics
  /export-csv/:event_id     → export attendees

The backend connects to the MySQL database and returns data as JSON.

Database (MySQL)
Tables:
- users(user_id PK, email, username, password, first_name, last_name, created_at, address, phone)
- event_organizers(org_id PK, first_name, last_name, username, phone, email, address, password, approved)
- newevents(event_id PK, org_id FK, title, description, image, event_date, event_time, location_name, capacity, ticket_policy, price, tickets_sold, attendance_count, created_at, status)
- bought_tickets(user_id FK, event_id FK, time)

Relationships:
- event_organizers → newevents (1 to many)
- users → bought_tickets (1 to many)
- newevents → bought_tickets (1 to many)
