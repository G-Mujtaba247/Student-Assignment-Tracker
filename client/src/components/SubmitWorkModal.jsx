import { useState } from 'react';
import { motion } from 'framer-motion';
import './SubmitWorkModal.css';

export default function SubmitWorkModal({ assignment, onSubmit, onCancel }) {
  const [work, setWork] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!work.trim()) {
      setError('Please enter your work before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(work.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="submit-modal-overlay" onClick={onCancel} role="presentation">
      <motion.div
        className="submit-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        role="dialog"
        aria-labelledby="submit-modal-title"
        aria-modal="true"
      >
        <div className="submit-modal-header">
          <div>
            <h2 id="submit-modal-title">✅ Submit Assignment</h2>
            <p className="submit-modal-subtitle">{assignment?.title}</p>
          </div>
          <button
            type="button"
            className="submit-modal-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert error" role="alert">
              <span>❌</span> {error}
            </div>
          )}

          <label htmlFor="submit-work-input" className="form-label">
            Your work
          </label>
          <textarea
            id="submit-work-input"
            placeholder="Paste a link, notes, or description of your completed work…"
            value={work}
            onChange={e => setWork(e.target.value)}
            rows={4}
            autoFocus
          />
          <p className="submit-modal-hint">
            Tip: You can paste a GitHub link, Google Doc URL, or brief summary of your work.
          </p>

          <div className="submit-modal-actions">
            <button type="submit" disabled={loading} className="submit-modal-primary">
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Submitting…
                </>
              ) : (
                <>✅ Submit work</>
              )}
            </button>
            <button type="button" className="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
