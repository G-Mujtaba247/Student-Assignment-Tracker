import express from 'express';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import { createQuiz, getQuizzes, submitQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.use(protect);
router.get('/', getQuizzes);
router.post('/', admin, createQuiz);
router.post('/:id/submit', submitQuiz);

export default router;
