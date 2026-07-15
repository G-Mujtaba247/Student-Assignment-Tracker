import { useEffect, useState } from 'react';
import api from '../api.js';
import { motion } from 'framer-motion';
import './AssignmentForm.css';

const MAX_DESC = 500;

function AssignmentForm({ initialData = null, onAdd, onUpdate, onCancel }) {
  const [title, setTitle]               = useState('');
  const [studentName, setStudentName]   = useState('');
  const [description, setDescription]   = useState('');
  const [dueDate, setDueDate]           = useState('');
  const [status, setStatus]             = useState('pending');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const isEditing = Boolean(initialData?._id);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStudentName(initialData.studentName || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
      setStatus(initialData.status || 'pending');
    } else {
      setTitle('');
      setStudentName('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
    }
  }, [initialData]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { title, studentName, description, dueDate, status };
      let response;
      if (initialData?._id) {
        response = await api.put(`/assignments/${initialData._id}`, payload);
        onUpdate(response.data);
      } else {
        response = await api.post('/assignments', payload);
        onAdd(response.data);
        setTitle('');
        setStudentName('');
        setDescription('');
        setDueDate('');
        setStatus('pending');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save assignment.');
    } finally {
      setLoading(false);
    }
  };

  const descCharsLeft = MAX_DESC - description.length;
  const descOverLimit = descCharsLeft < 0;

  return (
    <div className="form-overlay" onClick={onCancel}>
      <motion.div 
        className="form-container"
        onClick={e => e.stopPropagation()}
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
      {/* Header */}
      <div className="form-header">
        <div className="form-header-left">
          <h2>{isEditing ? '✏️ Update Assignment' : '📝 New Assignment'}</h2>
          <p className="form-subtitle">
            {isEditing
              ? 'Edit the details below and save your changes.'
              : 'Fill in the details to create a new assignment.'}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            className="form-close-btn"
            onClick={onCancel}
            title="Close form"
            aria-label="Close form"
            id="form-close-btn"
          >
            ✕
          </button>
        )}
      </div>

      {error && <div className="alert error" role="alert"><span>✕</span> {error}</div>}

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="af-title" className="form-label">Assignment Title <span className="required-star">*</span></label>
          <input
            id="af-title"
            type="text"
            placeholder="e.g., Math Assignment #5"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Student Name */}
        <div className="form-group">
          <label htmlFor="af-student" className="form-label">Student Name</label>
          <input
            id="af-student"
            type="text"
            placeholder="e.g., John Doe"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
          />
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="af-due" className="form-label">Due Date</label>
          <input
            id="af-due"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="af-status" className="form-label">Status</label>
          <select id="af-status" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">⏳ Pending</option>
            <option value="in progress">🚀 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {/* Description — full width */}
        <div className="form-group-full">
          <label htmlFor="af-desc" className="form-label">Description</label>
          <textarea
            id="af-desc"
            placeholder="Add details, instructions, or notes about this assignment…"
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
            rows="4"
          />
          <span className={`char-counter ${descOverLimit ? 'over-limit' : descCharsLeft < 50 ? 'near-limit' : ''}`}>
            {description.length}/{MAX_DESC}
          </span>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="form-submit" id="form-submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner" />
                {isEditing ? 'Saving…' : 'Creating…'}
              </>
            ) : (
              <>
                <span>{isEditing ? '✏️' : '➕'}</span>
                {isEditing ? 'Update Assignment' : 'Create Assignment'}
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              className="form-secondary secondary"
              onClick={onCancel}
              id="form-cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      </motion.div>
    </div>
  );
}

export default AssignmentForm;
