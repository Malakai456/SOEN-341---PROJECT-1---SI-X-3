const mysql = require('mysql');  // *****
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
            status:  user.status,
            org_id: user.org_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,                             // 'user' or 'admin' or 'organizer'
            organizer_status: user.organizer_status       // 'none' or 'pending' or'approved' | 'rejected'
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

app.get('/admin/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error fetching users');
        res.json(results);
    });
});

app.get('/admin/organizations', (req, res) => {
    const query = 'SELECT * FROM organizations';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error fetching organizations');
        res.json(results);
    });
});

  app.put('/admin/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('User role updated ');
    });
  });

  app.delete('/admin/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) return res.status(500).send('Error deleting user');
        res.send('User deleted successfully');
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
// Admin guard that checks DB for admin role
function adminGuard(req, res, next) {
  const userId = Number(req.header('x-user-id') || 0);
  if (!userId) return res.status(401).json({ error: 'missing user' });

  const sql = 'SELECT role FROM users WHERE user_id = ? LIMIT 1';
  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!rows.length || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'admin only' });
    }
    req.userId = userId; 
    next();
  });
}

// Display pending organizer requests
app.get('/api/admin/organizers/pending', adminGuard, (req, res) => {
  const sql = `
    SELECT user_id, first_name, last_name, username, email, created_at
    FROM users
    WHERE organizer_status = 'pending'
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

//Approve or reject a specific organizer
app.patch('/api/admin/organizers/:userId', adminGuard, (req, res) => {
  const userId = Number(req.params.userId);
  const { decision } = req.body; // 'approve' or will be 'reject'

  if (!userId) return res.status(400).json({ error: 'bad id' });
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approve|reject' });
  }

  const sql =
    decision === 'approve'
      ? `UPDATE users
           SET organizer_status = 'approved', role = 'organizer'
         WHERE user_id = ? AND organizer_status = 'pending'`
      : `UPDATE users
           SET organizer_status = 'rejected', role = 'user'
         WHERE user_id = ? AND organizer_status = 'pending'`;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (result.affectedRows === 0) {
      return res.status(409).json({ message: 'No pending request for this user' });
    }
    res.json({ ok: true, userId, decision });
  });
});
// WHEN EVENT ORGANIZER CREATES EVENTS 
app.post('/api/events', (req, res) => {
    const {
        org_id,
        title,
        description,
        event_date,
        event_time,
        location_name,
        capacity,
        ticket_policy,
        price
    } = req.body;

    const query = `
        INSERT INTO newEvents 
        (org_id, title, description, event_date, event_time, location_name, capacity, ticket_policy, price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [org_id, title, description, event_date, event_time, location_name, capacity, ticket_policy, price || 0], (err, result) => {
        if (err) {
            console.error('Error inserting event:', err);
            return res.status(500).send('Error adding event');
        }
    
        res.status(201).send('Event created successfully');
    });
});


app.get('/api/events', (req, res) => {
    const query = 'SELECT * FROM newEvents ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).send('Error fetching events');
        }
        res.status(200).json(results);
    });
});


// BUY EVENT BUTTON API
app.post('/buy', (req, res) => {
  const { user_id, event_id } = req.body;
  console.log('🟢 /buy request received:', req.body);

  if (!user_id || !event_id) {
    return res.status(400).send('Missing user_id or event_id');
  }

  const sql = `INSERT INTO bought_tickets (user_id, event_id) VALUES (?, ?)`;

  db.query(sql, [user_id, event_id], (err) => {
    if (err) {
      console.error('❌ MySQL error when inserting into bought_tickets:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('You already bought a ticket for this event.');
      }
      return res.status(500).send('Database error.');
    }

    res.status(201).send('Ticket successfully recorded!');
  });
});


app.get('/api/event-analytics', (req, res) => {
  const query = `
    SELECT 
      e.event_id,
      e.title,
      e.capacity,
      COUNT(t.event_id) AS tickets_sold,
      (e.capacity - COUNT(t.event_id)) AS remaining_capacity
    FROM newEvents e
    LEFT JOIN bought_tickets t ON e.event_id = t.event_id
    GROUP BY e.event_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching analytics:', err);
      return res.status(500).send('Error fetching event analytics');
    }
    res.json(results);
  });
});


//CSV EXPORT
app.get('/export-csv/:event_id', (req, res) => {
  const { event_id } = req.params;

  const query = `
    SELECT 
      e.title AS event_title,
      u.first_name, u.last_name, u.email, u.phone, 
      b.time AS purchase_time
    FROM bought_tickets b
    JOIN users u ON b.user_id = u.user_id
    JOIN newevents e ON b.event_id = e.event_id
    WHERE b.event_id = ?;
  `;

  db.query(query, [event_id], (err, rows) => {
    if (err) {
      console.error('❌ Error generating CSV:', err);
      return res.status(500).send('Database error');
    }

    if (!rows.length) {
      return res.status(404).send('No attendees found for this event.');
    }

    // Create CSV string
    const headers = Object.keys(rows[0]).join(',') + '\n';
    const values = rows
      .map(r => Object.values(r).map(v => `"${v}"`).join(','))
      .join('\n');

    const csvData = headers + values;

    // Set response headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees_event_${event_id}.csv"`);
    res.send(csvData);
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
