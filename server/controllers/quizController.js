import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { notifyStudentsOfQuiz } from '../services/quizEmail.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const studentQuiz = (quiz, attempt) => ({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  questions: quiz.questions.map(({ _id, prompt, options }) => ({
    _id,
    prompt,
    options,
  })),
  publishedAt: quiz.publishedAt,
  expiresAt: quiz.expiresAt,
  attempt: attempt ? {
    score: attempt.score,
    passed: attempt.passed,
    submittedAt: attempt.submittedAt,
  } : null,
});

export const getQuizzes = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Student access required.' });
    }
    const [quizzes, attempts] = await Promise.all([
      Quiz.find().sort({ publishedAt: -1 }),
      QuizAttempt.find({ student: req.user.id }),
    ]);
    const attemptsByQuiz = new Map(attempts.map(attempt => [attempt.quiz.toString(), attempt]));
    res.json(quizzes.map(quiz => studentQuiz(quiz, attemptsByQuiz.get(quiz._id.toString()))));
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Quiz title is required.' });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Add at least one question.' });
    }

    const normalizedQuestions = [];
    for (const [index, question] of questions.entries()) {
      if (
        typeof question.prompt !== 'string'
        || !question.prompt.trim()
        || !Array.isArray(question.options)
        || question.options.length < 2
        || question.options.some(option => typeof option !== 'string' || !option.trim())
        || !Number.isInteger(question.correctAnswer)
        || question.correctAnswer < 0
        || question.correctAnswer >= question.options.length
      ) {
        return res.status(400).json({ message: `Question ${index + 1} is incomplete or invalid.` });
      }
      normalizedQuestions.push({
        prompt: question.prompt.trim(),
        options: question.options.map(option => option.trim()),
        correctAnswer: question.correctAnswer,
      });
    }

    const publishedAt = new Date();
    const quiz = await Quiz.create({
      title: title.trim(),
      description,
      questions: normalizedQuestions,
      createdBy: req.user.id,
      publishedAt,
      expiresAt: new Date(publishedAt.getTime() + THREE_DAYS_MS),
    });
    const students = await User.find({ role: 'user' }).select('name email');
    const emailDelivery = await notifyStudentsOfQuiz(students, quiz);

    res.status(201).json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        publishedAt: quiz.publishedAt,
        expiresAt: quiz.expiresAt,
        questionCount: quiz.questions.length,
      },
      emailDelivery,
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Student access required.' });
    }
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }
    if (Date.now() >= quiz.expiresAt.getTime()) {
      return res.status(410).json({ message: 'This quiz has expired.' });
    }
    if (!Array.isArray(req.body.answers) || req.body.answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answer every question before submitting.' });
    }
    if (req.body.answers.some((answer, index) => (
      !Number.isInteger(answer)
      || answer < 0
      || answer >= quiz.questions[index].options.length
    ))) {
      return res.status(400).json({ message: 'One or more selected answers are invalid.' });
    }

    const existingAttempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user.id });
    if (existingAttempt) {
      return res.status(409).json({ message: 'You have already submitted this quiz.' });
    }

    const correctCount = req.body.answers.reduce(
      (count, answer, index) => count + (answer === quiz.questions[index].correctAnswer ? 1 : 0),
      0,
    );
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    try {
      const attempt = await QuizAttempt.create({
        quiz: quiz._id,
        student: req.user.id,
        answers: req.body.answers,
        score,
        passed: score >= 75,
      });
      res.status(201).json({
        score: attempt.score,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'You have already submitted this quiz.' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
