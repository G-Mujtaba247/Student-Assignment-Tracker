import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import Header from '../components/Header.jsx';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');
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
    if (!user || user.role !== 'admin') {
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
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/admin/assignments/${id}`);
        setAssignments(prev => prev.filter(item => item._id !== id));
        setMessage('🗑️ Assignment deleted successfully.');
        window.setTimeout(() => setMessage(''), 3500);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to delete assignment.');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query) || 
      u.role.toLowerCase().includes(query)
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
    <>
      <Header
        title="Admin Dashboard"
        subtitle="Monitor users, assignments, and system activity."
        user={user}
        showAdminLink={false}
        onLogout={handleLogout}
      />
      <div className="app-shell">
        <div className="page-card">
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <span>👥 Users</span>
              <strong>{stats.users}</strong>
            </div>
            <div className="summary-card">
              <span>📋 Assignments</span>
              <strong>{stats.assignments}</strong>
            </div>
            <div className="summary-card">
              <span>⏳ Pending</span>
              <strong>{stats.pending}</strong>
            </div>
            <div className="summary-card">
              <span>✅ Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>

          {/* Alerts */}
          {message && <div className="alert success"><span>✓</span> {message}</div>}
          {error && <div className="alert error"><span>✕</span> {error}</div>}

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              📋 Assignments
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading admin data...</div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <section className="admin-section">
                  <div className="section-header">
                    <h2>👥 Manage Users</h2>
                    <input
                      type="search"
                      placeholder="🔍 Search by name, email, or role"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  {filteredUsers.length ? (
                    <div className="users-grid">
                      {filteredUsers.map(u => (
                        <div key={u._id} className="user-card">
                          <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          <h3>{u.name}</h3>
                          <p className="meta">{u.email}</p>
                          <p className="user-role">{u.role === 'admin' ? '⚙️ Admin' : '👤 User'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No users match your search</p>
                    </div>
                  )}
                </section>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <section className="admin-section">
                  <div className="section-header">
                    <h2>📋 All Assignments</h2>
                    <input
                      type="search"
                      placeholder="🔍 Search by title, student, or owner"
                      value={assignmentSearch}
                      onChange={e => setAssignmentSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  {filteredAssignments.length ? (
                    <div className="assignment-grid">
                      {filteredAssignments.map(a => (
                        <div key={a._id} className="assignment-card">
                          <div className="assignment-header">
                            <div>
                              <h3>{a.title}</h3>
                              <p className="meta">Owner: {a.createdBy?.name || 'Unknown'}</p>
                            </div>
                            <span className={`status-chip status-${a.status.replace(' ', '-')}`}>
                              {a.status === 'pending' && '⏳'}
                              {a.status === 'in progress' && '🚀'}
                              {a.status === 'completed' && '✅'}
                              {' '}{a.status}
                            </span>
                          </div>

                          <p className="meta">👤 Student: {a.studentName || 'Unassigned'}</p>
                          {a.description && <p className="description">{a.description}</p>}
                          <p className="meta">📅 Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</p>

                          <div className="admin-actions">
                            <button 
                              className="danger"
                              onClick={() => handleDeleteAssignment(a._id)}
                              title="Delete this assignment"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No assignments match your search</p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
