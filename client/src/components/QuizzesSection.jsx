import { useCallback, useEffect, useState } from 'react';
import api from '../api.js';
import './QuizzesSection.css';

const remainingTime = expiresAt => {
  const milliseconds = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const days = Math.floor(milliseconds / 86400000);
  const hours = Math.floor((milliseconds % 86400000) / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  if (days) return `${days}d ${hours}h remaining`;
  if (hours) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default function QuizzesSection() {
  const [quizzes, setQuizzes] = useState([]);
  const [answersByQuiz, setAnswersByQuiz] = useState({});
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');

  const fetchQuizzes = useCallback(async () => {
    setError('');
    try {
      const response = await api.get('/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load quizzes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [fetchQuizzes]);

  const selectAnswer = (quizId, questionIndex, answerIndex) => {
    setAnswersByQuiz(current => ({
      ...current,
      [quizId]: { ...current[quizId], [questionIndex]: answerIndex },
    }));
  };

  const submitQuiz = async (event, quiz) => {
    event.preventDefault();
    setError('');
    const answers = quiz.questions.map((_, index) => answersByQuiz[quiz._id]?.[index]);
    if (answers.some(answer => !Number.isInteger(answer))) {
      setError(`Please answer every question in "${quiz.title}" before submitting.`);
      return;
    }
    setSubmittingId(quiz._id);
    try {
      const response = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      setQuizzes(current => current.map(item => (
        item._id === quiz._id ? { ...item, attempt: response.data } : item
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit quiz.');
      if (err.response?.status === 410) await fetchQuizzes();
    } finally {
      setSubmittingId('');
    }
  };

  const sortedQuizzes = [...quizzes].sort((a, b) => (
    Number(new Date(a.expiresAt).getTime() <= now) - Number(new Date(b.expiresAt).getTime() <= now)
    || new Date(b.publishedAt) - new Date(a.publishedAt)
  ));

  return (
    <section className="student-quizzes" aria-labelledby="student-quizzes-title">
      <div className="student-quizzes__heading">
        <div>
          <h2 id="student-quizzes-title">📝 Quizzes</h2>
          <p>Complete each quiz within three days of its publication. You need 75% to pass.</p>
        </div>
        <button type="button" className="secondary" onClick={fetchQuizzes}>Refresh</button>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}
      {loading ? (
        <p className="student-quizzes__empty">Loading quizzes…</p>
      ) : sortedQuizzes.length === 0 ? (
        <p className="student-quizzes__empty">No quizzes have been published yet.</p>
      ) : (
        <div className="student-quizzes__list">
          {sortedQuizzes.map(quiz => {
            const expired = new Date(quiz.expiresAt).getTime() <= now;
            const attempt = quiz.attempt;
            return (
              <article className="student-quiz-card" key={quiz._id}>
                <div className="student-quiz-card__heading">
                  <div>
                    <h3>{quiz.title}</h3>
                    {quiz.description && <p>{quiz.description}</p>}
                  </div>
                  <span className={`quiz-state ${attempt ? 'quiz-state--done' : expired ? 'quiz-state--expired' : 'quiz-state--open'}`}>
                    {attempt ? 'Submitted' : expired ? 'Expired' : remainingTime(quiz.expiresAt)}
                  </span>
                </div>

                {attempt ? (
                  <div className={`quiz-result ${attempt.passed ? 'quiz-result--passed' : 'quiz-result--failed'}`} role="status">
                    <strong>{attempt.passed ? 'Passed' : 'Not passed'} — {attempt.score}%</strong>
                    <span>{attempt.passed ? 'Great work!' : 'Please try next time with better luck.'}</span>
                  </div>
                ) : expired ? (
                  <p className="quiz-expired-note">The deadline has passed. This quiz can no longer be submitted.</p>
                ) : (
                  <form onSubmit={event => submitQuiz(event, quiz)}>
                    {quiz.questions.map((question, questionIndex) => (
                      <fieldset className="student-quiz-question" key={question._id}>
                        <legend>{questionIndex + 1}. {question.prompt}</legend>
                        <div className="student-quiz-options">
                          {question.options.map((option, optionIndex) => (
                            <label className="student-quiz-option" key={optionIndex}>
                              <input
                                type="radio"
                                name={`${quiz._id}-${question._id}`}
                                checked={answersByQuiz[quiz._id]?.[questionIndex] === optionIndex}
                                onChange={() => selectAnswer(quiz._id, questionIndex, optionIndex)}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                    <button
                      type="submit"
                      className="student-quiz-submit"
                      disabled={submittingId === quiz._id}
                    >
                      {submittingId === quiz._id ? 'Submitting…' : 'Submit quiz'}
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
