import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME,
});

// REGISTER USER
export const register = async (req, res) => {
  console.log("🟢 Register route hit:", req.body);
  const { first_name, last_name, username, email, password, confirmPassword } = req.body;

  if (!first_name || !last_name || !username || !email || !password || !confirmPassword) {
    console.log("⚠️ Missing fields");
    return res.render('register', { message: 'Please fill in all fields.' });
  }

  if (password !== confirmPassword) {
    console.log("⚠️ Password mismatch");
    return res.render('register', { message: 'Passwords do not match.' });
  }

  try {
    DB.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error("❌ DB SELECT error:", error);
        return res.render('register', { message: 'Database error during email check.' });
      }

      console.log("📊 Email check results:", results);

      if (results.length > 0) {
        console.log("⚠️ Email already exists:", email);
        return res.render('register', { message: 'Email already registered.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        email,
        username,
        password_hash: hashedPassword,
        first_name,
        last_name,
      };

      console.log("🟢 Attempting insert with:", newUser);

      DB.query('INSERT INTO users SET ?', newUser, (err, result) => {
        console.log("🧩 INSERT CALLBACK TRIGGERED");
        if (err) {
          console.error("❌ MySQL insert error:", err.sqlMessage || err);
          return res.render('register', { message: 'Insert error: ' + (err.sqlMessage || err) });
        }

        console.log("✅ Insert success:", result);
        req.session.message = 'Account created successfully!';
        return res.redirect('/login');
      });
    });
  } catch (error) {
    console.error("💥 Fatal register route error:", error);
    return res.render('register', { message: 'Unexpected server error.' });
  }
};



// LOGIN USER
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { message: 'Please fill in all fields.' });
  }

  DB.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.error("❌ DB error:", error);
      return res.render('login', { message: 'Database error. Try again later.' });
    }

    if (results.length === 0) {
      return res.render('login', { message: 'No account found with that email.' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.render('login', { message: 'Incorrect password.' });
    }

    // Login successful
    req.session.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    console.log("✅ User logged in:", req.session.user);
    res.redirect('/profile');
  });
};


// LOGOUT USER
export const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

export default { register, login, logout };
