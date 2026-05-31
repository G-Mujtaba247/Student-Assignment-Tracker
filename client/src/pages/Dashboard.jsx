import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import AssignmentForm from '../components/AssignmentForm.jsx';
import AssignmentList from '../components/AssignmentList.jsx';

function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sat_user') || 'null');

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAssignments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sat_token');
    localStorage.removeItem('sat_user');
    navigate('/login');
  };

  const handleAdd = newAssignment => {
    setAssignments(prev => [newAssignment, ...prev]);
    setMessage('Assignment added successfully.');
    window.setTimeout(() => setMessage(''), 3500);
  };

  const handleUpdate = updated => {
    setAssignments(prev => prev.map(item => (item._id === updated._id ? updated : item)));
    setMessage('Assignment updated.');
    window.setTimeout(() => setMessage(''), 3500);
  };

  const handleDelete = id => {
    setAssignments(prev => prev.filter(item => item._id !== id));
    setMessage('Assignment removed.');
    window.setTimeout(() => setMessage(''), 3500);
  };

  return (
    <div className="page-card">
      <div className="header-row">
        <div>
          <h1 className="page-title">Assignment Tracker</h1>
          <p>Welcome back, {user?.name}! Manage student assignments with ease.</p>
        </div>
        <div className="nav-actions">
          {user?.role === 'admin' && (
            <button className="secondary" onClick={() => navigate('/admin')}>Admin dashboard</button>
          )}
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}

      <AssignmentForm onAdd={handleAdd} />

      {loading ? (
        <p>Loading assignments...</p>
      ) : (
        <AssignmentList
          assignments={assignments}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Dashboard;
