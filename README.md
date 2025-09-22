# SOEN-341---PROJECT-1-
Concordia SOEN 341, Project 1, Team SI-X-3

TEAM MEMBERS (Name, Student Id, GitHub user name) :
- Mekouar Ali ( 40273411 ) allix05
- Jennifer Avakian ( 40263197 ) jenzo2903
- Jean Zhang ( 40177899 ) malakai456
- Ashfakur Rahman ( 40287274 ) ash2450
- Serena Zafari (40316423)  serenazaf
- Sarah El Mzouri ( 40318344 ) sarahelmz
- Souhail Ouchai (40286766) Souhvvl
- Idriss Benabdessadek ( 40248720 ) idrissben03



OBJECTIVE:

This project is a Campus Events & Ticketing Web Application designed to help students discover, organize, and attend events on campus. The project will be designed with the needs of three users in mind, the students, organizers, and administrators.


The objectives of this project will thus be to:
1. Enable students to search, save, and attend campus events.
2. Provide organizers with event management tools (creation, ticketing, analytics).
3. Equip administrators with oversight and moderation features.
4. Improve transparency and engagement through analytics and dashboards.


CORE FEATURES:

1. Student Event Experience

-Browse and search events (filters by date, category, organization).
-User Interface (such as a calendar) to display all events (additional feature)
-Save events to a personal calendar.
-Claim free or paid tickets.
-Receive a unique QR code ticket for entry.
-Students could register for notifications(SMS or mail) of upcoming events.

2. Organizer Event Management
-Create and manage events for the calendar (title, description, date/time, location, ticket capacity, type).
-View event analytics (tickets issued, attendance, remaining capacity).
-Export attendee lists (CSV).
-Validate tickets with an integrated QR scanner.

3. Administrator Dashboard & Moderation
-Approve organizers actions.
-Moderate event listings for compliance.
-View global stats (number of events, tickets issued, participation trends).
-Manage organizations and assign roles.

The goal is to streamline event management, increase student engagement, and provide actionable insights for administrators and organizers.  

Last Core Feature (TBD) 
- The extra feature is not yet decided. 


LANGUAGES AND TECHNIQUE:

For the frontend we are planning to use:

HTML & CSS for the styling and structure of the pages 
Javascript for the logic and user interactivity 
React (not sure yet) 

For the backend:

We will be using either Node.js + Express or PHP. This will allow the frontend to interact with the backend data. In addition, this is necessary for handling user authentication and also QR code generation. 

For the database we will use a relation database such as MySQL (or PostgreSQL if hosting is required) for defining schemas, constraints, and querying data and store all user accounts, roles, events, ticket claims, etc.
Access can be made through the backend (Node/Express or Django) using safe parameterized queries or an ORM. (TBD)


