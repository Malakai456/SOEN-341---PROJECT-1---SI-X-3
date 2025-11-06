const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: '341_project_sara'
    });
    console.log(' Connected to MySQL database');
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

app.get('/', (req, res) => res.send('Server is running!'));

// USER REGISTER
app.post('/register', async (req, res) => {
  const { first_name, last_name, username, password, phone, email, address } = req.body;
  try {
    await db.query(
      `INSERT INTO users (first_name, last_name, username, password, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, username, password, phone, email, address]
    );
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// USER LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (!results.length) return res.status(401).send('Invalid username or password.');
    const user = results[0];
    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in.');
  }
});

// EVENT ORGANIZER REGISTER / LOGIN

app.post('/registerEventOrg', async (req, res) => {
  const { first_name, last_name, username, phone, email, address, password } = req.body;
  try {
    await db.query(
      `INSERT INTO event_organizers (first_name, last_name, username, phone, email, address, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, username, phone, email, address, password]
    );
    res.status(201).send('Event Organizer registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering Event Organizer');
  }
});

app.post('/loginEventOrg', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM event_organizers WHERE username = ? AND password = ?', [username, password]);
    if (!results.length) return res.status(401).send('Invalid username or password.');
    const user = results[0];
    res.json({
      org_id: user.org_id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in.');
  }
});


// EVENT CREATION + RETRIEVAL
app.post('/api/events', async (req, res) => {
  const { org_id, title, description, event_date, event_time, location_name, capacity, ticket_policy, price } = req.body;
  try {
    await db.query(
      `INSERT INTO newEvents (org_id, title, description, event_date, event_time, location_name, capacity, ticket_policy, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [org_id, title, description, event_date, event_time, location_name, capacity, ticket_policy, price || 0]
    );
    res.status(201).send('Event created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding event');
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM newEvents ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching events');
  }
});

//BUY EVENT
app.post('/buy', async (req, res) => {
  const { user_id, event_id } = req.body;
  if (!user_id || !event_id) return res.status(400).send('Missing user_id or event_id');

  try {
    await db.query('INSERT INTO bought_tickets (user_id, event_id) VALUES (?, ?)', [user_id, event_id]);
    res.status(201).send('Ticket successfully recorded!');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('You already bought a ticket for this event.');
    console.error(err);
    res.status(500).send('Database error.');
  }
});


app.get('/api/event-analytics', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        e.event_id,
        e.title,
        e.capacity,
        COUNT(t.event_id) AS tickets_sold,
        (e.capacity - COUNT(t.event_id)) AS remaining_capacity
      FROM newEvents e
      LEFT JOIN bought_tickets t ON e.event_id = t.event_id
      GROUP BY e.event_id;
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching event analytics');
  }
});

//  EXPORT FULL ATTENDEE LIST FOR AN EVENT
app.get('/export-csv/:event_id', async (req, res) => {
  const { event_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        e.title AS event_title,
        CONCAT(u.first_name, ' ', u.last_name) AS attendee_name,
        u.email AS attendee_email,
        u.phone AS attendee_phone,
        u.address AS attendee_address,
        e.location_name AS event_location,
        e.event_date,
        e.event_time,
        e.price AS ticket_price,
        b.time AS purchase_time
      FROM bought_tickets b
      JOIN users u ON b.user_id = u.user_id
      JOIN newevents e ON b.event_id = e.event_id
      WHERE b.event_id = ?
      ORDER BY b.time DESC;
    `, [event_id]);

    if (!rows.length) {
      return res.status(404).send('No attendees found for this event.');
    }

    const headers = Object.keys(rows[0]).join(',') + '\n';
    const values = rows
      .map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(','))
      .join('\n');

    const csvData = headers + values;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees_event_${event_id}.csv"`);
    res.send(csvData);
  } catch (err) {
    console.error('Error ', err);
    res.status(500).send('Database error');
  }
});


app.get('/api/pending-organizers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM event_organizers WHERE approved = 0');
    res.json(rows);
  } catch (err) {
    console.error(' Error ', err);
    res.status(500).send(err.message);
  }
});

app.put('/api/approve-organizer/:id', async (req, res) => {
  try {
    await db.query('UPDATE event_organizers SET approved = 1 WHERE org_id = ?', [req.params.id]);
    res.send('Organizer approved!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/events/moderate', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM newevents WHERE status = 'pending'");
    res.json(rows);
  } catch (err) {
    console.error(' Error', err);
    res.status(500).send(err.message);
  }
});

app.put('/api/events/approve/:id', async (req, res) => {
  try {
    await db.query("UPDATE newevents SET status = 'approved' WHERE event_id = ?", [req.params.id]);
    res.send('Event approved!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/api/events/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM newevents WHERE event_id = ?', [req.params.id]);
    res.send('Event deleted!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
