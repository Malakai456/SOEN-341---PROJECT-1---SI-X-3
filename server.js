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
    port:'3307',
    password: '', 
    database: "341_project" 
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
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
            status: user.status ?? 'approved',
            organizer_id: user.organizer_id ?? user.user_id ?? null
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
    SELECT organizer_id, first_name, last_name, username, email, created_at
    FROM event_organizers
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

//Approve or reject a specific organizer
app.patch('/api/admin/organizers/:organizerId', adminGuard, (req, res) => {
  const organizerId = Number(req.params.organizerId);
  const { decision } = req.body; // 'approve' or'reject'

  if (!organizerId) return res.status(400).json({ error: 'bad id' });
  if (!['approve','reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approve|reject' });
  }

  const newStatus = decision === 'approve' ? 'approved' : 'rejected';
  const sql = `
    UPDATE event_organizers
       SET status = ?
     WHERE organizer_id = ? AND status = 'pending'
  `;

  db.query(sql, [newStatus, organizerId], (err, result) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (result.affectedRows === 0) {
      return res.status(409).json({ message: 'no pending request for this organizer' });
    }
    res.json({ ok: true, organizerId, decision });
  });
});
