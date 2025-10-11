import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
console.log('DB ENV:', process.env.DATABASE_USER, process.env.DATABASE_PASSWORD);

const DB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    port: process.env.DATABSE_PORT,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE
});

const register = (req, res) => {
    console.log(req.body);

    const { full_name, user_name, password, confirmedPassword, email, phone_number } = req.body

     if (!email || !password) {
    return res.render('register', { message: 'Please fill in all fields.' });
  }

    DB.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'This email has already been registered.'
            });
        } else if (password !== confirmedPassword) {
            return res.render('register', {
                message: 'Passwords do not match.'
            });
        } else {
            // Insert user into database or handle successful registration here
            res.send("Form submitted");
        }
    });

    DB.query(
      'INSERT INTO users (full_name, user_name, password, email, phone_number) VALUES (?, ?, ?, ?, ?)',
      [full_name, user_name, password, email, phone_number],
      (err2) => {
        if (err2) return res.render('register', { message: 'Error creating account.' });
        res.render('login', { message: 'Account created successfully! Please log in.' });
      }
    );
};

export const login = (req, res) => {
  const { email, password } = req.body;
  DB.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.render('login', { message: 'Database error.' });
    if (results.length === 0)
      return res.render('login', { message: 'Invalid credentials.' });

    res.render('mainpage', { message: `Welcome, ${results[0].user_name}!` });
  });
};

export default { register, login };