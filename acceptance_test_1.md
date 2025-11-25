# Acceptance Testing – Student Event Experience
## 1.0 User Authentication
### 1.0.1 User Sign Up

**Description:**
As a student, I want to register for an account so that I can access the event system.

**Preconditions:**
* User is not logged in.
* The `users` table exists in the database.

**Steps to Test:**
1. Open `register.html`.
2. Fill in all required fields (first name, last name, username, password, phone, email, address).
3. Click the Register button.

**Expected Result:**
* A message “Registration successful!” appears.
* The user’s data is added to the `users` table.
* The system redirects to `login.html`.

**Pass Criteria:**
User registration data is stored correctly and redirection works.


### 1.0.2 User Login

**Description:**
As a student, I want to log into my account so that I can view and buy event tickets.

**Preconditions:**
* User credentials exist in the `users` table.

**Steps to Test:**
1. Open `login.html`.
2. Enter username and password.
3. Click Login.

**Expected Result:**
* A message “Login successful!” appears.
* User data is saved in `localStorage`.
* Page redirects to `events.html`.

**Pass Criteria:**
Valid users can log in; invalid credentials display an “Invalid username or password” message.


## 1.1 Event Browsing and Search

### 1.1.1 Filter by Date, Category, or Organization

**Description:**
As a student, I want to filter events by date, category, or club to find relevant ones.

**Preconditions:**
* Events exist in the database.

**Steps to Test:**
1. Go to `events.html`.
2. Select a filter type (Date, Price, or Club).
3. Choose a filter value.

**Expected Result:**
* Events update dynamically to show only those matching the filter.

**Pass Criteria:**
Filters work instantly without having to reload the page.

---

### 1.1.2 Display Filtered Results Instantly

**Description:**
As a student, I want results to appear immediately when filters change.

**Steps to Test:**

1. Change between multiple filters (Price → Club → Date).
2. Observe event cards update in real time.

**Expected Result:**

* Event cards are filtered instantly using JavaScript (MixItUp).

**Pass Criteria:**
Filtering is smooth and responsive.

## 1.2 User Interface for Events

### 1.2.1 Display All Available Events

**Description:**
As a student, I want to see all events displayed in an easy-to-read grid format.

**Steps to Test:**

1. Log in and open `events.html`.
2. Verify all database events appear as cards.
3. Check each card shows:

   * Image
   * Title
   * Date and Time
   * Location
   * Description
   * Price
   * Buy Button

**Expected Result:**
Events are displayed in a responsive grid with all details.

**Pass Criteria:**
Each event card shows correct information and image.



## 1.3 Calendar Integration

### 1.3.1 Add Purchased Event to Calendar

**Description:**
As a student, I want events I buy to be automatically added to my personal calendar.

**Steps to Test:**

1. Log in as a student.
2. Click on Buy button.
3. Accept that you want to buy ticket by clicking on "Yes"
4. Click on MyCalendar or go to `calendar.html` in the header .

**Expected Result:**
The event appears on its correct date in the calendar.

**Pass Criteria:**
Event details are correctly displayed in the user’s calendar.



## 1.4 Ticket Claiming

### 1.4.1 Claim Free or Paid Tickets

**Description:**
As a student, I want to claim tickets (free or paid) for events I am interested in.

**Preconditions:**

* User is logged in.
* Event exists in the database.

**Steps to Test:**

1. On `events.html`, click Buy.
2. Confirm purchase when prompted.

**Expected Result:**

* Ticket is recorded in `bought_tickets` table.
* Confirmation message appears.
* Ticket opens in `ticket.html`.

**Pass Criteria:**
Ticket successfully created for both free and paid events.


## 1.5 QR Code Generation

### 1.5.1 Generate a Unique QR Code

**Description:**
As a student, I want each purchased ticket to include a unique QR code for easy event check-in.

**Steps to Test:**

1. After buying an event, view `ticket.html`.
2. Scan the QR code using a phone.

**Expected Result:**

* QR code is visible and unique per ticket.
* Scanning opens `verify.html?ticketId=TICKET-XXXXX`.

**Pass Criteria:**
QR code loads correctly, matches event data, and redirects to the correct verification link.

