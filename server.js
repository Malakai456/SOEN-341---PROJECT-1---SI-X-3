const mysql = require('mysql');
const express = require('express'); 
const path = require('path'); // if not already present


const cors = require('cors');
const app = express();

const PORT = 5000;
app.use(cors());
app.use(express.json());                      // for JSON fetches
app.use(express.urlencoded({ extended: true })); // for form POSTs
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.send('Server is running!');
});



const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    port:'3306',
    password: '', 
    database: "341_project_SARAH" 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

const MODERATION_STATUSES = [
  'pending',
  'flagged',
  'approved',
  'needs_revision',
  'removed'
];

const ACTION_TO_STATUS = {
  approve: 'approved',
  remove: 'removed',
  flag_for_revision: 'needs_revision'
};


app.post('/register', (req, res) => {
    const { first_name,last_name, username, password, phone, email, address } = req.body;
    const query = `
        INSERT INTO users (first_name, last_name, username, password, phone, email, address) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [first_name, last_name, username, password, phone, email, address], (err, result) => {
        if (err) {
            console.error('Error inserting user into database:', err);
            res.status(500).send('Error registering user');
        } else {
            res.status(201).send('User registered successfully');
        }
    });

});


app.post('/login', (req, res) => {
  // support both JSON and form-encoded bodies
  const username = (req.body && (req.body.username ?? req.body['username'])) || '';
  const password = (req.body && (req.body.password ?? req.body['password'])) || '';

  if (!username || !password) return res.status(400).send('Missing credentials');

  const sql = 'SELECT user_id, username FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ /login SQL error:', err.code, err.sqlMessage || err.message);
      return res.status(500).send('Database error');
    }
    if (results.length === 0) return res.status(401).send('Invalid username or password');

    const user = results[0];

    // if JSON expected, send JSON; otherwise send small HTML that sets localStorage & redirects
    const wantsJson =
      (req.headers['content-type'] || '').includes('application/json') ||
      (req.headers['accept'] || '').includes('application/json');

    if (wantsJson) return res.json({ message: 'Login successful', user });

    const payload = JSON.stringify(user).replace(/</g, '\\u003c');
    res.send(`<!doctype html><meta charset="utf-8"><script>
      localStorage.setItem('loggedUser', '${payload}');
      location.href = 'events.html';
    </script>`);
  });
});
app.post('/buyEvent', (req, res) => {
    const { title, price, location } = req.body;
   console.log(price);

    const query = `INSERT INTO user_events (title, price, location) VALUES (?, ?, ?)`;
    db.query(query, [title, price, location], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to save event' });
        }
        res.status(201).json({ message: 'Event successfully saved!' });
    });
});

//ADDED THESE ROUTES FOR LOGIN AND REGISTER EVENT ORG
app.post('/registerEventOrg', (req, res) => {
    const { first_name, last_name, username, phone, email, address, password } = req.body;
    const query = `
        INSERT INTO event_organizers (first_name, last_name, username, phone, email, address, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [first_name, last_name, username, phone, email, address, password], (err, result) => {
        if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Error registering Event Organizer');
        }
        res.status(201).send('Event Organizer registered successfully');
    });
});

// Login user
app.post('/loginEventOrg', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM event_organizers WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging in.');
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid username or password.');
        }

        const user = results[0];
        res.status(200).json({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address
        });
    });
});

// === BUY: insert into event_buys (user_id, event_id, time) ===
// expects JSON: { user_id, event_id }
app.post('/buy', (req, res) => {
  let { user_id, event_id } = req.body;

  user_id  = Number(user_id);
  event_id = Number(event_id);
  if (!user_id || !event_id) return res.status(400).send('Invalid payload');

  // NOTE: time column is named `time` (quote it)
  const sql = 'INSERT INTO event_buys (user_id, event_id, `time`) VALUES (?, ?, NOW())';

  db.query(sql, [user_id, event_id], (err) => {
    if (err) {
      console.error('❌ /buy SQL error:', err.code, err.sqlMessage);
      return res.status(500).send('Database error');
    }
    return res.status(200).json({ ok: true, message: 'Purchase recorded' });
  });
});

// === Admin moderation endpoints ===

app.get('/admin/events/flagged', (req, res) => {
  const sql = `
    SELECT
      e.event_id,
      e.title,
      e.description,
      e.starts_at,
      e.ends_at,
      e.capacity,
      e.ticket_policy,
      e.moderation_status,
      o.org_name AS organization_name,
      l.name AS location_name
    FROM events e
    LEFT JOIN organizations o ON e.org_id = o.org_id
    LEFT JOIN locations l ON e.location_id = l.location_id
    WHERE e.moderation_status = 'flagged'
    ORDER BY e.starts_at ASC, e.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ /admin/events/flagged SQL error:', err.code, err.sqlMessage || err.message);
      return res.status(500).json({ message: 'Database error fetching flagged events' });
    }
    res.json(results || []);
  });
});

app.patch('/admin/events/:eventId/moderation', (req, res) => {
  const eventId = Number(req.params.eventId);
  const { action } = req.body || {};

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ message: 'Invalid event id' });
  }

  if (!action || !ACTION_TO_STATUS[action]) {
    return res.status(400).json({ message: 'Invalid moderation action' });
  }

  const newStatus = ACTION_TO_STATUS[action];

  if (!MODERATION_STATUSES.includes(newStatus)) {
    return res.status(400).json({ message: 'Unsupported moderation status' });
  }

  const updateSql = `
    UPDATE events
    SET moderation_status = ?
    WHERE event_id = ?
  `;

  db.query(updateSql, [newStatus, eventId], (updateErr, updateResult) => {
    if (updateErr) {
      console.error('❌ /admin/events/:id/moderation SQL error:', updateErr.code, updateErr.sqlMessage || updateErr.message);
      return res.status(500).json({ message: 'Database error updating moderation status' });
    }

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const fetchSql = `
      SELECT
        e.event_id,
        e.title,
        e.description,
        e.starts_at,
        e.ends_at,
        e.capacity,
        e.ticket_policy,
        e.moderation_status,
        o.org_name AS organization_name,
        l.name AS location_name
      FROM events e
      LEFT JOIN organizations o ON e.org_id = o.org_id
      LEFT JOIN locations l ON e.location_id = l.location_id
      WHERE e.event_id = ?
      LIMIT 1
    `;

    db.query(fetchSql, [eventId], (fetchErr, rows) => {
      if (fetchErr) {
        console.error('❌ /admin/events/:id/moderation fetch SQL error:', fetchErr.code, fetchErr.sqlMessage || fetchErr.message);
        return res.status(500).json({ message: 'Database error fetching updated event' });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: 'Event not found after update' });
      }

      res.json(rows[0]);
    });
  });
});
