import api from '../api.js';
import api from '../api.js';
import { motion, AnimatePresence } from 'framer-motion';
import './AssignmentList.css';

/* ── Helpers ── */
function isOverdue(assignment) {
  if (!assignment.dueDate) return false;
  if (assignment.status === 'completed' || assignment.submitted) return false;
  return new Date(assignment.dueDate) < new Date();
}

function getStrip(assignment) {
  if (assignment.submitted) return 'strip--submitted';
  if (assignment.status === 'completed') return 'strip--completed';
  if (assignment.status === 'in progress') return 'strip--in-progress';
  return 'strip--pending';
}

function getStatusChip(assignment) {
  if (assignment.submitted) return { cls: 'status-submitted',   label: '✅ Submitted' };
  if (assignment.status === 'completed')  return { cls: 'status-completed',  label: '✅ Completed' };
  if (assignment.status === 'in progress') return { cls: 'status-in-progress', label: '🚀 In Progress' };
  return { cls: 'status-pending', label: '⏳ Pending' };
}

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ── Main Component ── */
function AssignmentList({ assignments, onEdit, onUpdate, onDelete }) {

  const startWorking = async assignment => {
    if (assignment.submitted) return;
    try {
      const response = await api.put(`/assignments/${assignment._id}`, { status: 'in progress' });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error starting assignment:', err);
    }
  };

  const submitAssignment = async assignment => {
    if (assignment.submitted) return;
    try {
      const response = await api.put(`/assignments/${assignment._id}`, {
        status: 'completed',
        submitted: true,
      });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error submitting assignment:', err);
    }
  };

  const removeAssignment = async id => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      onDelete(id);
    } catch (err) {
      console.error('Error deleting assignment:', err);
    }
  };

  if (!assignments.length) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-state-icon" aria-hidden="true">📚</span>
        <p><strong>No assignments found</strong></p>
        <p>Try adjusting your filters or click <em>New assignment</em> to get started!</p>
      </div>
    );
  }

  return (
    <motion.div className="assignment-grid" role="list" layout>
      <AnimatePresence>
      {assignments.map((item, index) => {
        const overdue = isOverdue(item);
        const { cls, label } = getStatusChip(item);
        const stripCls = getStrip(item);

        return (
          <motion.article
            key={item._id}
            className="assignment-card"
            role="listitem"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            {/* Colored top strip */}
            <div className={`assignment-card__strip ${stripCls}`} aria-hidden="true" />

            <div className="assignment-card__body">
              {/* Header row */}
              <div className="assignment-header">
                <div>
                  <h3>{item.title}</h3>
                  <p className="meta">👤 {item.studentName || 'Unassigned'}</p>
                </div>
                <span className={`status-chip ${cls}`} aria-label={`Status: ${label}`}>
                  {label}
                </span>
              </div>

              {/* Overdue badge */}
              {overdue && (
                <div className="overdue-badge" role="alert" aria-label="Assignment is overdue">
                  🔴 Overdue
                </div>
              )}

              {/* Description */}
              {item.description && (
                <p className="description-text">{item.description}</p>
              )}

              {/* Due date */}
              <div className="assignment-meta">
                📅 <strong>Due:</strong> {formatDate(item.dueDate)}
                {item.submittedAt && (
                  <span className="submitted-at"> · Submitted {formatDate(item.submittedAt)}</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="action-row">
              {item.submitted ? (
                <p className="read-only-note" role="note">
                  🔒 Submitted — read-only
                </p>
              ) : (
                <>
                  {item.status === 'pending' && (
                    <button
                      onClick={() => startWorking(item)}
                      className="secondary"
                      title="Start working on this assignment"
                      id={`start-btn-${item._id}`}
                    >
                      🚀 Start
                    </button>
                  )}
                  {item.status !== 'pending' && (
                    <button
                      onClick={() => submitAssignment(item)}
                      className="secondary active"
                      title="Submit this assignment"
                      id={`submit-btn-${item._id}`}
                    >
                      ✅ Submit
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(item)}
                    className="secondary"
                    title="Edit assignment"
                    id={`edit-btn-${item._id}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => removeAssignment(item._id)}
                    className="danger"
                    title="Delete assignment"
                    id={`delete-btn-${item._id}`}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </motion.article>
        );
      })}
      </AnimatePresence>
    </motion.div>
  );
}

export default AssignmentList;
