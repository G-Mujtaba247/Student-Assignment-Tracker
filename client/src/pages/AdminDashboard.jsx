import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import Header from '../components/Header.jsx';
import './AdminDashboard.css';

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* Count-up hook */
function useCountUp(target, duration = 700) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, icon, variant }) {
  const animated = useCountUp(value);
  return (
    <div className={`summary-card summary-card--${variant}`} aria-label={`${label}: ${value}`}>
      <span className="summary-card__icon" aria-hidden="true">{icon}</span>
      <span className="summary-card__label">{label}</span>
      <span className="summary-card__value">{animated}</span>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers]             = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [message, setMessage]         = useState('');
  const [userSearch, setUserSearch]   = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [activeTab, setActiveTab]     = useState('users');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sat_user') || 'null');

  const showMessage = useCallback((msg, isError = false) => {
    if (isError) { setError(msg); setMessage(''); }
    else         { setMessage(msg); setError(''); }
    window.setTimeout(() => { setMessage(''); setError(''); }, 3500);
  }, []);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, assignRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/assignments'),
      ]);
      setUsers(userRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sat_token');
    localStorage.removeItem('sat_user');
    navigate('/login');
  };

  const handleDeleteAssignment = async id => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      setAssignments(prev => prev.filter(item => item._id !== id));
      showMessage('🗑️ Assignment deleted successfully.');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Unable to delete assignment.', true);
    }
  };

  /* Assignment count per user */
  const assignCountByUser = useMemo(() => {
    const map = {};
    assignments.forEach(a => {
      const uid = a.createdBy?._id || a.createdBy;
      if (uid) map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [assignments]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredAssignments = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.studentName || '').toLowerCase().includes(q) ||
      (a.createdBy?.name || '').toLowerCase().includes(q)
    );
  }, [assignments, assignSearch]);

  const stats = {
    users:       users.length,
    assignments: assignments.length,
    pending:     assignments.filter(a => a.status === 'pending').length,
    completed:   assignments.filter(a => a.status === 'completed').length,
  };

  return (
    <>
      <Header
        title="Admin Dashboard"
        subtitle="Monitor users, assignments, and system activity across the platform."
        user={user}
        showAdminLink={false}
        onLogout={handleLogout}
      />

      <div className="app-shell">
        <div className="page-wrapper">
          <div className="page-card">

            {/* ── Stats ── */}
            <div className="summary-grid">
              <StatCard label="Users"       value={stats.users}       icon="👥" variant="total"    />
              <StatCard label="Assignments" value={stats.assignments}  icon="📋" variant="progress" />
              <StatCard label="Pending"     value={stats.pending}     icon="⏳" variant="pending"  />
              <StatCard label="Completed"   value={stats.completed}   icon="✅" variant="done"     />
            </div>

            {/* ── Alerts ── */}
            {message && <div className="alert success" role="status"><span>✓</span> {message}</div>}
            {error   && <div className="alert error"   role="alert" ><span>✕</span> {error}</div>}

            {/* ── Tabs ── */}
            <div className="admin-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'users'}
                className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
                id="tab-users"
              >
                👥 Users
                <span className="tab-badge">{users.length}</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'assignments'}
                className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setActiveTab('assignments')}
                id="tab-assignments"
              >
                📋 Assignments
                <span className="tab-badge">{assignments.length}</span>
              </button>
            </div>

            {loading ? (
              <div className="admin-skeleton">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ padding: '20px' }}>
                      <div className="skeleton sk-title" />
                      <div className="skeleton sk-sub" />
                      <div className="skeleton sk-body" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* ── Users Tab ── */}
                {activeTab === 'users' && (
                  <section className="admin-section" aria-labelledby="tab-users">
                    <div className="section-header">
                      <h2 className="section-title">👥 Manage Users</h2>
                      <div className="search-wrap" style={{ maxWidth: 320, width: '100%' }}>
                        <span className="search-icon" aria-hidden="true">🔍</span>
                        <input
                          type="search"
                          id="user-search"
                          placeholder="Search by name, email or role…"
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          className="search-input"
                          aria-label="Search users"
                        />
                      </div>
                    </div>

                    {filteredUsers.length ? (
                      <div className="users-grid">
                        {filteredUsers.map(u => (
                          <div key={u._id} className="user-card">
                            <div className={`user-avatar-admin ${u.role === 'admin' ? 'admin-role' : ''}`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <h3>{u.name}</h3>
                            <p className="user-email">{u.email}</p>
                            <div className="user-card-footer">
                              <span className={`role-chip ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                {u.role === 'admin' ? '⚙️ Admin' : '👤 Student'}
                              </span>
                              <span className="assignment-count-badge">
                                📋 {assignCountByUser[u._id] || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">🔍</span>
                        <p><strong>No users found</strong></p>
                        <p>Try a different search term.</p>
                      </div>
                    )}
                  </section>
                )}

                {/* ── Assignments Tab ── */}
                {activeTab === 'assignments' && (
                  <section className="admin-section" aria-labelledby="tab-assignments">
                    <div className="section-header">
                      <h2 className="section-title">📋 All Assignments</h2>
                      <div className="search-wrap" style={{ maxWidth: 320, width: '100%' }}>
                        <span className="search-icon" aria-hidden="true">🔍</span>
                        <input
                          type="search"
                          id="assign-search"
                          placeholder="Search by title, student or owner…"
                          value={assignSearch}
                          onChange={e => setAssignSearch(e.target.value)}
                          className="search-input"
                          aria-label="Search assignments"
                        />
                      </div>
                    </div>

                    {filteredAssignments.length ? (
                      <div className="assignment-grid">
                        {filteredAssignments.map(a => (
                          <div key={a._id} className="assignment-card">
                            <div className={`assignment-card__strip strip--${a.status.replace(' ', '-')}`} />
                            <div className="assignment-card__body">
                              <div className="assignment-header">
                                <div>
                                  <h3>{a.title}</h3>
                                  <p className="meta">👤 Owner: {a.createdBy?.name || 'Unknown'}</p>
                                </div>
                                <span className={`status-chip status-${a.status.replace(' ', '-')}`}>
                                  {a.status === 'pending' && '⏳'}
                                  {a.status === 'in progress' && '🚀'}
                                  {a.status === 'completed' && '✅'}
                                  {' '}{a.status}
                                </span>
                              </div>
                              <p className="meta">🎓 Student: {a.studentName || 'Unassigned'}</p>
                              {a.description && (
                                <p className="description-text">{a.description}</p>
                              )}
                              <div className="assignment-meta">
                                📅 <strong>Due:</strong> {formatDate(a.dueDate)}
                              </div>
                            </div>
                            <div className="action-row">
                              <button
                                className="danger"
                                onClick={() => handleDeleteAssignment(a._id)}
                                id={`admin-delete-${a._id}`}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">📋</span>
                        <p><strong>No assignments found</strong></p>
                        <p>Try a different search term.</p>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
