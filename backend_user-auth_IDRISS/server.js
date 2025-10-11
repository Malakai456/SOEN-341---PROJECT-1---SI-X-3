import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import pagesRouter from './routes/pages.js';
import authRouter from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();



const publicDirectory = path.join(__dirname,'public');
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
//Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');


const DB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME 
});

  
DB.connect((error) => {
    if(error){
        console.log("Failed connection to the database: ", error.message);
    }else {
        console.log('mySQL connected');
    }
});

//Define the Routes

app.use('/', pagesRouter);
app.use('/auth', authRouter);

app.listen(5000, () => {
    console.log('Server is started on port 5000');
});
