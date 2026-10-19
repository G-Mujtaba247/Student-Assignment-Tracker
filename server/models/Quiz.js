import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [{
      type: String,
      required: true,
      trim: true,
    }],
    validate: {
      validator: options => options.length >= 2,
      message: 'Each question must have at least two options.',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: questions => questions.length > 0,
      message: 'A quiz must have at least one question.',
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
