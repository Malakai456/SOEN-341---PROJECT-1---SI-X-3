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

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
