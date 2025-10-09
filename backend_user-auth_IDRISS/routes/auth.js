import express from 'express';
import authController from '../controllers/auth.js';

const authRouter = express.Router();

authRouter.post('/register', authController.register);

export default authRouter;