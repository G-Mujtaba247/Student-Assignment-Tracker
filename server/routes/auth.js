import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

export default router;
