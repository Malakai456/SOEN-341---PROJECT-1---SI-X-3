import express from 'express';

const pagesRouter = express.Router();

pagesRouter.get('/', (req, res) =>{ //Route For the homepage
    res.render('index');
});

pagesRouter.get('/register', (req, res) =>{ //Route For the regisration page
    res.render('register');
});

export default pagesRouter;