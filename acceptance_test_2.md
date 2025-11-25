# Acceptance Testing – Event Manager Experience

## 2.1 Event Details Visibility

### 2.1.1 Display Event Information

**Description:**  
As an event manager, I want all event details (title, description, date, time, location, capacity, and ticket type) to be visible to students.

**Preconditions:**  
- The event exists in the database (`newevents` table).

**Steps to Test:**  
1. Log in as an event organizer.  
2. Open `create_events.html` or `events.html`.  
3. Verify that each event shows:  
   - Title  
   - Description  
   - Date and Time  
   - Location  
   - Capacity  
   - Ticket Type (Free or Paid)

**Expected Result:**  
All event information is correctly displayed and matches the data in the database.

**Pass Criteria:**  
Every event shows accurate and complete information.



## 2.2 Live Dashboard Information

### 2.2.1 Display Event Analytics

**Description:**  
As an event manager, I want to view event analytics (tickets issued, attendance rate, remaining capacity) on a dashboard.

**Preconditions:**  
- Events exist in `newevents`.  
- Tickets have been purchased (`bought_tickets` table).

**Steps to Test:**  
1. Sign up as an event organiser.
1. If already have an account, Log in as an event organizer.  
2. Open `event_dashboard.html`.  
3. Select an event from the dropdown list.

**Expected Result:**  
The dashboard displays the number of tickets sold, attendance rate, and remaining capacity with charts.

**Pass Criteria:**  
Dashboard loads real-time data correctly from the database.



## 2.3 Export and Validate Attendance

### 2.3.1 Export Attendee List (CSV)

**Description:**  
As an event manager, I want to export the attendee list in a CSV file to track registrations.

**Preconditions:**  
- The event has attendees in the `bought_tickets` table.

**Steps to Test:**  
1. Open `event_dashboard.html`.  
2. Select an event.  
3. Click the **Export CSV** button.

**Expected Result:**  
A CSV file downloads containing attendee names, emails, and ticket information.

**Pass Criteria:**  
CSV file includes all attendee data.

### 2.3.2 QR Code Ticket Validation

**Description:**  
As an event manager, I want to confirm ticket entry using a QR scanner to verify authenticity.

**Preconditions:**  
- Each ticket includes a unique QR code (`ticket.html`).

**Steps to Test:**  
1. Open `ticket.html` for a purchased event.  
2. Scan the QR code with a scanner or phone.

**Expected Result:**  
The QR code opens `verify.html?ticketId=TICKET-XXXXX` and confirms the ticket as valid.

**Pass Criteria:**  
Valid tickets are accepted; invalid or duplicate tickets are rejected.
