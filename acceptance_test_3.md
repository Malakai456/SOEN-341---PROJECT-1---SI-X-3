# Acceptance Testing – Administrator Experience

## 3.1 Approve Organizer Accounts

### 3.1.1 Display Pending Organizer Requests

**Description:**  
As an administrator, I want to view a list of pending organizer accounts that require approval.

**Preconditions:**  
- Organizer accounts exist in the `event_organizers` table with `approved = 0`.

**Steps to Test:**  
1. Open `admin.html`.  
2. Scroll to the **Pending Organizer Approvals** section.  

**Expected Result:**  
All unapproved organizers appear in a table with their names, emails, and usernames.

**Pass Criteria:**  
Pending organizers are displayed correctly.



### 3.1.2 Approve Organizer Accounts

**Description:**  
As an administrator, I want to approve or reject organizer accounts so that only verified users can post events.

**Preconditions:**  
- Organizer account is displayed in the pending table.

**Steps to Test:**  
1. Click the **Approve** button next to a pending organizer.  
2. Confirm that the request is sent to the backend.  
3. Refresh the page.

**Expected Result:**  
- The organizer disappears from the pending list.  
- Their `approved` status changes to `1` in the database.

**Pass Criteria:**  
Organizer approval updates successfully in the database.

---

## 3.2 Event Moderation

### 3.2.1 Display Pending Events

**Description:**  
As an administrator, I want to see all events waiting for moderation or approval.

**Preconditions:**  
- Events exist in the `newevents` table with `status = 'pending'`.

**Steps to Test:**  
1. Open `admin.html`.  
2. Scroll to the Event Moderation section.  

**Expected Result:**  
All pending events are listed in a table with their title, organizer, and status.

**Pass Criteria:**  
Pending events appear correctly on the dashboard.



### 3.2.2 Approve or Delete Events

**Description:**  
As an administrator, I want to approve or delete event listings to maintain platform policy compliance.

**Steps to Test:**  
1. Click **Approve** to validate an event.  
2. Click **Delete** to remove an event from the system.  

**Expected Result:**  
- Approved events update their status to `approved`.  
- Deleted events are removed from the database.

**Pass Criteria:**  
Actions correctly update the database and refresh the dashboard.


## 3.3 Platform Analytics

### 3.3.1 View Global Statistics

**Description:**  
As an administrator, I want to view overall platform statistics such as total events, tickets sold, and participation rates.

**Preconditions:**  
- Events and tickets exist in the database.

**Steps to Test:**  
1. Open `admin_analytics.html`.  
2. Wait for data to load automatically.  

**Expected Result:**  
Displays:  
- Total number of events  
- Tickets issued  
- Participation or attendance rate  

**Pass Criteria:**  
All statistics are displayed accurately using data from the database.



## 3.4 User and Role Management

### 3.4.1 Manage User Accounts and Roles

**Description:**  
As an administrator, I want to view and update user and organizer roles to control permissions on the platform.

**Preconditions:**  
- Users and organizers exist in the database.

**Steps to Test:**  
1. Open the User Management section of the admin dashboard.  
2. View all users and their assigned roles.  
3. Select a user and assign a new role (e.g., organizer, admin).  

**Expected Result:**  
The role update is reflected immediately in the user list and stored in the database.

**Pass Criteria:**  
Role assignments update successfully without errors.
