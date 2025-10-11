import express from 'express';

const pagesRouter = express.Router();

pagesRouter.get('/', (req, res) =>{ //Route For the homepage
    res.render('mainpage');
});

pagesRouter.get('/register', (req, res) =>{ //Route For the regisration page
    res.render('register');
});

pagesRouter.get('/login', (req,res) => {
    res.render('login');
});

pagesRouter.get('/contact', (req, res) => {
    res.render('contact');
});

pagesRouter.get('/events', (req, res) => {
    res.render('events');
});

export default pagesRouter;