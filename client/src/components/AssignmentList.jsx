import api from '../api.js';
import './AssignmentList.css';

function AssignmentList({ assignments, onEdit, onUpdate, onDelete }) {
  const statusOptions = [
    { value: 'pending', label: '⏳ Pending', icon: '⏳' },
    { value: 'in progress', label: '🚀 In Progress', icon: '🚀' },
    { value: 'completed', label: '✅ Completed', icon: '✅' },
  ];

  const updateStatus = async (assignment, status) => {
    if (assignment.status === status) return;
    try {
      const response = await api.put(`/assignments/${assignment._id}`, { status });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error updating status:', err);
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
            <span className={`status-chip status-${item.status.replace(' ', '-')}`}>
              {statusOptions.find(s => s.value === item.status)?.label}
            </span>
          </div>

          {item.description && <p className="description">{item.description}</p>}
          
          <div className="assignment-meta">
            <p className="meta">📅 Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</p>
          </div>

          <div className="action-row">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => updateStatus(item, status.value)}
                className={item.status === status.value ? 'secondary active' : 'secondary'}
                disabled={item.status === status.value}
                title={`Mark as ${status.label}`}
              >
                {status.icon}
              </button>
            ))}
            <button
              onClick={() => onEdit(item)}
              className="secondary"
              title="Edit assignment"
            >
              ✏️
            </button>
            <button 
              onClick={() => removeAssignment(item._id)} 
              className="danger"
              title="Delete assignment"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
