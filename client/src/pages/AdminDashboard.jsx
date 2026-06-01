import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sat_user') || 'null');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, assignmentRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/assignments'),
      ]);
      setUsers(userRes.data);
      setAssignments(assignmentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sat_token');
    localStorage.removeItem('sat_user');
    navigate('/login');
  };

  const handleDeleteAssignment = async id => {
    try {
      await api.delete(`/admin/assignments/${id}`);
      setAssignments(prev => prev.filter(item => item._id !== id));
      setMessage('Assignment deleted successfully.');
      window.setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete assignment.');
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.role.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const filteredAssignments = useMemo(() => {
    const query = assignmentSearch.trim().toLowerCase();
    return assignments.filter(a =>
      a.title.toLowerCase().includes(query) ||
      (a.studentName || '').toLowerCase().includes(query) ||
      (a.createdBy?.name || '').toLowerCase().includes(query)
    );
  }, [assignments, assignmentSearch]);

  const stats = {
    users: users.length,
    assignments: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    completed: assignments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="page-card">
      <div className="header-row">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p>Welcome, {user?.name}. Monitor users and assignments.</p>
        </div>
        <div className="nav-actions">
          <button className="secondary" onClick={() => navigate('/')}>Back to tracker</button>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Users</span>
          <strong>{stats.users}</strong>
        </div>
        <div className="summary-card">
          <span>Assignments</span>
          <strong>{stats.assignments}</strong>
        </div>
        <div className="summary-card">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>

      <div className="filter-row">
        <input
          type="search"
          placeholder="Search users"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
        />
        <input
          type="search"
          placeholder="Search assignments"
          value={assignmentSearch}
          onChange={e => setAssignmentSearch(e.target.value)}
        />
      </div>

      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <>
          <section className="assignment-card" style={{ marginBottom: '24px' }}>
            <h2>Users</h2>
            {filteredUsers.length ? (
              <div className="assignment-grid">
                {filteredUsers.map(u => (
                  <div key={u._id} className="assignment-card user-card">
                    <h3>{u.name}</h3>
                    <p className="meta">{u.email}</p>
                    <p className="meta">Role: {u.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No users match your search.</p>
            )}
          </section>

          <section className="assignment-card">
            <h2>All Assignments</h2>
            {filteredAssignments.length ? (
              <div className="assignment-grid">
                {filteredAssignments.map(a => (
                  <div key={a._id} className="assignment-card">
                    <div className="assignment-header">
                      <div>
                        <h3>{a.title}</h3>
                        <p className="meta">Owner: {a.createdBy?.name || 'Unknown'} ({a.createdBy?.email})</p>
                      </div>
                      <span className={`status-chip status-${a.status.replace(' ', '-')}`}>{a.status}</span>
                    </div>
                    <p className="meta">Student: {a.studentName || 'Unassigned'}</p>
                    {a.description && <p>{a.description}</p>}
                    <p className="meta">Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}</p>
                    <button className="danger" onClick={() => handleDeleteAssignment(a._id)}>Delete assignment</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No assignments match your search.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
