import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: {
    type: [Number],
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
