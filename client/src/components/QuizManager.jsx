import { useState } from 'react';
import api from '../api.js';
import './QuizManager.css';

const createQuestion = () => ({
  prompt: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

export default function QuizManager({ onPublished }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([createQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQuestion = (questionIndex, changes) => {
    setQuestions(current => current.map((question, index) => (
      index === questionIndex ? { ...question, ...changes } : question
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const question = questions[questionIndex];
    updateQuestion(questionIndex, {
      options: question.options.map((option, index) => index === optionIndex ? value : option),
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/quizzes', { title, description, questions });
      setTitle('');
      setDescription('');
      setQuestions([createQuestion()]);
      onPublished(response.data.emailDelivery);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to publish quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="quiz-manager" aria-labelledby="quiz-manager-title">
      <div className="quiz-manager__intro">
        <h2 id="quiz-manager-title">Create a quiz</h2>
        <p>Students will be emailed when you publish. Quizzes expire three days after publishing; 75% is a passing score.</p>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="quiz-manager__field">
          Quiz title
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="e.g. Chapter 4 review"
            required
            maxLength={120}
          />
        </label>
        <label className="quiz-manager__field">
          Instructions (optional)
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            rows={2}
            maxLength={500}
          />
        </label>

        <div className="quiz-manager__questions">
          {questions.map((question, questionIndex) => (
            <fieldset className="quiz-editor-question" key={questionIndex}>
              <legend>Question {questionIndex + 1}</legend>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="quiz-remove-question"
                  onClick={() => setQuestions(current => current.filter((_, index) => index !== questionIndex))}
                  aria-label={`Remove question ${questionIndex + 1}`}
                >
                  Remove
                </button>
              )}
              <label className="quiz-manager__field">
                Question
                <input
                  value={question.prompt}
                  onChange={event => updateQuestion(questionIndex, { prompt: event.target.value })}
                  placeholder="Enter your question"
                  required
                  maxLength={500}
                />
              </label>
              <div className="quiz-editor-options">
                {question.options.map((option, optionIndex) => (
                  <label className="quiz-manager__field" key={optionIndex}>
                    Option {optionIndex + 1}
                    <input
                      value={option}
                      onChange={event => updateOption(questionIndex, optionIndex, event.target.value)}
                      required
                      maxLength={300}
                    />
                  </label>
                ))}
              </div>
              <label className="quiz-manager__field quiz-correct-answer">
                Correct answer
                <select
                  value={question.correctAnswer}
                  onChange={event => updateQuestion(questionIndex, { correctAnswer: Number(event.target.value) })}
                >
                  {question.options.map((_, optionIndex) => (
                    <option value={optionIndex} key={optionIndex}>Option {optionIndex + 1}</option>
                  ))}
                </select>
              </label>
            </fieldset>
          ))}
        </div>

        <div className="quiz-manager__actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setQuestions(current => [...current, createQuestion()])}
          >
            Add question
          </button>
          <button type="submit" disabled={loading} className="quiz-publish-button">
            {loading ? 'Publishing…' : 'Publish quiz and notify students'}
          </button>
        </div>
      </form>
    </section>
  );
}
