const mysql = require('mysql');
const express = require('express'); 

const cors = require('cors');
const app = express();

const PORT = 5000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running!');
});



const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: "341_project_sara" 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
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
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
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
            last_name : user.last_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address
        });
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
            org_id: user.org_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address
        });
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
