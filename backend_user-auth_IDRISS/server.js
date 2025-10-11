import express from 'express';
import path from 'path';
import hbs from 'hbs';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import session from 'express-session';
import { fileURLToPath } from 'url';
import pagesRouter from './routes/pages.js';
import authRouter from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files (CSS, images)
const publicDirectory = path.join(__dirname, 'public');
app.use(express.static(publicDirectory));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// SESSION SETUP
app.use(session({
  secret: 'supersecretkey', // You can replace with process.env.SESSION_SECRET
  resave: false,
  saveUninitialized: false,
}));

// GLOBAL USER VARIABLE (for navbar)
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});


// DATABASE CONNECTION
const DB = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME
});

DB.connect((error) => {
  if (error) {
    console.error("Failed to connect to the database:", error.message);
  } else {
    console.log(" MySQL connected");
  }
});

// ROUTES
app.use('/', pagesRouter);
app.use('/', authRouter);

// START SERVER
app.listen(5000, () => {
  console.log(" Server started on port 5000");
});
