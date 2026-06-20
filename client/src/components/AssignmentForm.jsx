import { useState } from 'react';
import api from '../api.js';
import './AssignmentForm.css';

function AssignmentForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/assignments', {
        title,
        studentName,
        description,
        dueDate,
        status,
      });
      onAdd(response.data);
      setTitle('');
      setStudentName('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>📝 Create New Assignment</h2>
        <p className="form-subtitle">Add a new task and assign it to a student</p>
      </div>

      {error && <div className="alert error"><span>✕</span> {error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="title">Assignment Title *</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Math Assignment #5"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="student">Student Name</label>
          <input
            id="student"
            type="text"
            placeholder="e.g., John Doe"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">⏳ Pending</option>
            <option value="in progress">🚀 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        <div className="form-group-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Add details about this assignment..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="form-submit">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <span>➕</span> Create Assignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignmentForm;
