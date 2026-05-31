import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
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

      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <>
          <section className="assignment-card" style={{ marginBottom: '24px' }}>
            <h2>Users</h2>
            {users.length ? (
              <div className="assignment-grid">
                {users.map(u => (
                  <div key={u._id} className="assignment-card">
                    <h3>{u.name}</h3>
                    <p className="meta">{u.email}</p>
                    <p className="meta">Role: {u.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No users found.</p>
            )}
          </section>

          <section className="assignment-card">
            <h2>All Assignments</h2>
            {assignments.length ? (
              <div className="assignment-grid">
                {assignments.map(a => (
                  <div key={a._id} className="assignment-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <h3>{a.title}</h3>
                      <span className="meta">{a.status}</span>
                    </div>
                    <p className="meta">Owner: {a.createdBy?.name || 'Unknown'} ({a.createdBy?.email})</p>
                    <p className="meta">Student: {a.studentName || 'Unassigned'}</p>
                    {a.description && <p>{a.description}</p>}
                    <p className="meta">Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}</p>
                    <button className="danger" onClick={() => handleDeleteAssignment(a._id)}>Delete assignment</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No assignments found.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
