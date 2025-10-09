import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
console.log('DB ENV:', process.env.DATABASE_USER, process.env.DATABASE_PASSWORD);

const DB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE
});

const register = (req, res) => {
    console.log(req.body);

    const { full_name, user_name, password, confirmedPassword, email, phone_number } = req.body

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
};

export default { register };