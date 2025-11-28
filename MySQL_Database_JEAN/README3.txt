ISSUE #157: ADD Purchases Table & Relations
---------------------------------------------
1. SQL SCHEMA UPDATES
-----------------------------------------------------------------------------

To fully implement this feature, two main changes are required in the database:

A. UPDATE 'events' TABLE
   Code: ALTER TABLE `events` ADD COLUMN `price` DECIMAL(10, 2)...
   Why:  The original events table lacked a pricing field.

B. CREATE 'purchases' TABLE
   Code: CREATE TABLE `purchases` (...);
   Why:  This new table acts as the junction (link) between users and events.
         It records who bought what, when, and for how much.
----------------------------------------------------------------------------
2. INTEGRATION WITH BACKEND
-----------------------------------------------------------------------------

The database structure now supports the following backend operations:

- Viewing History (GET /api/me/purchases):
  Uses `SELECT ... FROM purchases JOIN events ...`. The Foreign Keys allow 
  efficient joining of these tables to display readable event details 
  (Title, Date) instead of just ID numbers.