import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import AssignmentForm from '../components/AssignmentForm.jsx';
import AssignmentList from '../components/AssignmentList.jsx';

function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
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

  const filteredAssignments = useMemo(() => {
    let items = [...assignments];

    if (statusFilter !== 'all') {
      items = items.filter(a => a.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      items = items.filter(a =>
        a.title.toLowerCase().includes(query) ||
        (a.studentName || '').toLowerCase().includes(query) ||
        (a.description || '').toLowerCase().includes(query)
      );
    }

    return items.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [assignments, searchTerm, statusFilter, sortBy]);

  const summary = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
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

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total assignments</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </div>
        <div className="summary-card">
          <span>In progress</span>
          <strong>{summary.inProgress}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </div>
      </div>

      <div className="filter-row">
        <input
          type="search"
          placeholder="Search by title, student, or notes"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="dueDate">Sort by due date</option>
          <option value="createdAt">Sort by newest</option>
        </select>
      </div>

      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}

      <AssignmentForm onAdd={handleAdd} />

      {loading ? (
        <p>Loading assignments...</p>
      ) : (
        <AssignmentList
          assignments={filteredAssignments}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Dashboard;
