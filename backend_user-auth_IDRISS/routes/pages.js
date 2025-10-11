import express from 'express';
const pagesRouter = express.Router();

pagesRouter.get('/', (req, res) => res.render('mainpage'));
pagesRouter.get('/register', (req, res) => res.render('register'));
pagesRouter.get('/login', (req, res) => res.render('login'));
pagesRouter.get('/contact', (req, res) => res.render('contact'));
pagesRouter.get('/events', (req, res) => res.render('events'));

pagesRouter.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});

pagesRouter.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default pagesRouter;