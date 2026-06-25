import { useEffect, useState } from 'react';
import api from '../api.js';
import './AssignmentForm.css';

function AssignmentForm({ initialData = null, onAdd, onUpdate, onCancel }) {
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const payload = {
        title,
        studentName,
        description,
        dueDate,
        status,
      };

      let response;
      if (initialData?._id) {
        response = await api.put(`/assignments/${initialData._id}`, payload);
        onUpdate(response.data);
      } else {
        response = await api.post('/assignments', payload);
        onAdd(response.data);
      }

      if (!initialData) {
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

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{isEditing ? '✏️ Update Assignment' : '📝 Create New Assignment'}</h2>
        <p className="form-subtitle">
          {isEditing ? 'Edit the assignment details and save your changes.' : 'Add a new task and assign it to a student.'}
        </p>
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
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <span>{isEditing ? '✏️' : '➕'}</span> {isEditing ? 'Update Assignment' : 'Create Assignment'}
              </>
            )}
          </button>
          {isEditing && onCancel && (
            <button type="button" className="form-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AssignmentForm;
