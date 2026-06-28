import api from '../api.js';
import './AssignmentList.css';

function AssignmentList({ assignments, onEdit, onUpdate, onDelete }) {
  const startWorking = async assignment => {
    if (assignment.isSubmitted) return;
    try {
      const response = await api.put(`/assignments/${assignment._id}`, { status: 'in progress' });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error starting assignment:', err);
    }
  };

  const submitAssignment = async assignment => {
    if (assignment.isSubmitted) return;
    try {
      const response = await api.put(`/assignments/${assignment._id}`, {
        status: 'completed',
        isSubmitted: true,
      });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error submitting assignment:', err);
    }
  };

  const removeAssignment = async id => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/assignments/${id}`);
        onDelete(id);
      } catch (err) {
        console.error('Error deleting assignment:', err);
      }
    }
  };

  if (!assignments.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <p><strong>No assignments found</strong></p>
        <p>Try adjusting your filters or create a new assignment to get started!</p>
      </div>
    );
  }

  return (
    <div className="assignment-grid">
      {assignments.map(item => (
        <div key={item._id} className="assignment-card">
          <div className="assignment-header">
            <div>
              <h3>{item.title}</h3>
              <p className="meta">👤 {item.studentName || 'Unassigned'}</p>
            </div>
            <span className={`status-chip status-${item.isSubmitted ? 'completed' : item.status.replace(' ', '-')}`}>
              {item.isSubmitted ? '✅ Submitted' : item.status === 'pending' ? '⏳ Pending' : item.status === 'in progress' ? '🚀 In Progress' : '✅ Completed'}
            </span>
          </div>

          {item.description && <p className="description">{item.description}</p>}
          
          <div className="assignment-meta">
            <p className="meta">📅 Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</p>
          </div>

          <div className="action-row">
            {!item.isSubmitted && item.status === 'pending' && (
              <button onClick={() => startWorking(item)} className="secondary" title="Start working on this assignment">
                🚀 Start
              </button>
            )}
            {!item.isSubmitted && item.status !== 'pending' && (
              <button onClick={() => submitAssignment(item)} className="secondary active" title="Submit this assignment">
                ✅ Submit
              </button>
            )}
            {!item.isSubmitted && (
              <>
                <button
                  onClick={() => onEdit(item)}
                  className="secondary"
                  title="Edit assignment"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => removeAssignment(item._id)} 
                  className="danger"
                  title="Delete assignment"
                >
                  🗑️ Delete
                </button>
              </>
            )}
            {item.isSubmitted && (
              <div className="meta" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                Read-only • submitted for review
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
