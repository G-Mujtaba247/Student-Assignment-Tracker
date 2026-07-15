import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import Header from '../components/Header.jsx';
import AssignmentForm from '../components/AssignmentForm.jsx';
import AssignmentList from '../components/AssignmentList.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

/* Animated count-up hook */
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

/* Summary card component */
function SummaryCard({ label, value, icon, variant }) {
  const animated = useCountUp(value);
  return (
    <div className={`summary-card summary-card--${variant}`} role="status" aria-label={`${label}: ${value}`}>
      <span className="summary-card__icon" aria-hidden="true">{icon}</span>
      <span className="summary-card__label">{label}</span>
      <span className="summary-card__value">{animated}</span>
    </div>
  );
}

/* Skeleton loading grid */
function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.06}s` }}>
          <div className="skeleton sk-strip" />
          <div style={{ padding: '16px' }}>
            <div className="skeleton sk-title" />
            <div className="skeleton sk-sub" />
            <div className="skeleton sk-body" />
            <div className="skeleton sk-footer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [message, setMessage]         = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('dueDate');
  const [showForm, setShowForm]       = useState(false);
  const [viewMode, setViewMode]       = useState('list'); // 'list' or 'board'
  const [editingAssignment, setEditingAssignment] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sat_user') || 'null');

  const showMessage = useCallback((msg, isError = false) => {
    if (isError) { 
      toast.error(msg, { position: 'bottom-center' });
    } else { 
      toast.success(msg, { position: 'bottom-center' });
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAssignments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sat_token');
    localStorage.removeItem('sat_user');
    navigate('/login');
  };

  const handleEdit = assignment => {
    setEditingAssignment(assignment);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleCloseForm = () => {
    setEditingAssignment(null);
    setShowForm(false);
  };

  const handleAdd = newAssignment => {
    setAssignments(prev => [newAssignment, ...prev]);
    showMessage('✅ Assignment added successfully!');
    setShowForm(false);
  };

  const handleUpdate = updated => {
    setAssignments(prev => prev.map(item => (item._id === updated._id ? updated : item)));
    setEditingAssignment(null);
    setShowForm(false);
    showMessage('✏️ Assignment updated successfully.');
  };

  const handleDelete = id => {
    setAssignments(prev => prev.filter(item => item._id !== id));
    showMessage('Assignment removed.');
  };

  const handleStatusChange = async (assignment, newStatus) => {
    try {
      const response = await api.put(`/assignments/${assignment._id}`, { status: newStatus });
      setAssignments(prev => prev.map(item => (item._id === response.data._id ? response.data : item)));
      showMessage('Status updated.');
    } catch (err) {
      showMessage('Failed to update status', true);
    }
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
    total:      assignments.length,
    pending:    assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in progress').length,
    completed:  assignments.filter(a => a.status === 'completed').length,
  };

  return (
    <>
      <Toaster />
      <Header
        title="Assignment Tracker"
        subtitle="Stay on top of your work — create, track and submit with ease."
        user={user}
        showAdminLink={true}
        onLogout={handleLogout}
      />

      <motion.div 
        className="app-shell"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-wrapper">
          <div className="page-card">

            {/* ── Summary Cards ── */}
            <div className="summary-grid">
              <SummaryCard label="Total"       value={summary.total}      icon="📊" variant="total"    />
              <SummaryCard label="Pending"     value={summary.pending}    icon="⏳" variant="pending"  />
              <SummaryCard label="In Progress" value={summary.inProgress} icon="🚀" variant="progress" />
              <SummaryCard label="Completed"   value={summary.completed}  icon="✅" variant="done"     />
            </div>

            {/* ── Filter & Search ── */}
            <div className="filter-section">
              <div className="filter-controls">
                <div className="search-wrap">
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="search"
                    id="dashboard-search"
                    placeholder="Search by title, student or description…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    aria-label="Search assignments"
                  />
                </div>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="all">📋 All statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="in progress">🚀 In progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  aria-label="Sort assignments"
                >
                  <option value="dueDate">📅 Sort by due date</option>
                  <option value="createdAt">🕐 Sort by newest</option>
                </select>
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  className="secondary"
                  onClick={() => setViewMode(prev => prev === 'list' ? 'board' : 'list')}
                  title="Toggle View Mode"
                >
                  {viewMode === 'list' ? '📋 Board View' : '📄 List View'}
                </button>
                <button
                  className={`toggle-form-btn ${showForm ? 'is-open' : ''}`}
                  onClick={() => showForm ? handleCloseForm() : setShowForm(true)}
                  id="toggle-form-btn"
                  aria-expanded={showForm}
                >
                  {showForm ? (
                    <><span>✕</span> Close form</>
                  ) : (
                    <><span>＋</span> New assignment</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Assignment Form ── */}
            <AnimatePresence>
            {showForm && (
              <AssignmentForm
                initialData={editingAssignment}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onCancel={handleCloseForm}
              />
            )}
            </AnimatePresence>

            {/* ── Result count ── */}
            {!loading && (
              <p className="results-count">
                Showing <strong>{filteredAssignments.length}</strong> of{' '}
                <strong>{assignments.length}</strong> assignment{assignments.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* ── Assignments ── */}
            {loading ? (
              <SkeletonGrid />
            ) : viewMode === 'list' ? (
              <AssignmentList
                assignments={filteredAssignments}
                onEdit={handleEdit}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ) : (
              <KanbanBoard 
                assignments={filteredAssignments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            )}

          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Dashboard;
