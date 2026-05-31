import { useState } from 'react';
import api from '../api.js';

function AssignmentForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

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
    }
  };

  return (
    <div className="assignment-card" style={{ marginBottom: '24px' }}>
      <h2>Create a new assignment</h2>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Student name"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="3"
        />
        <button type="submit">Add assignment</button>
      </form>
    </div>
  );
}

export default AssignmentForm;
