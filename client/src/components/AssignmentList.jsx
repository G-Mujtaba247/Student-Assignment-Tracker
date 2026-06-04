import api from '../api.js';

function AssignmentList({ assignments, onUpdate, onDelete }) {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const updateStatus = async (assignment, status) => {
    if (assignment.status === status) return;
    const response = await api.put(`/assignments/${assignment._id}`, { status });
    onUpdate(response.data);
  };

  const removeAssignment = async id => {
    await api.delete(`/assignments/${id}`);
    onDelete(id);
  };

  if (!assignments.length) {
    return (
      <div className="empty-state">
        <p>No assignments match your current filters yet. Try adjusting the search, changing the status filter, or adding a new assignment.</p>
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
              <p className="meta">Student: {item.studentName || 'Unassigned'}</p>
            </div>
            <span className={`status-chip status-${item.status.replace(' ', '-')}`}>{item.status}</span>
          </div>

          {item.description && <p>{item.description}</p>}
          <p className="meta">Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}</p>

          <div className="action-row">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => updateStatus(item, status.value)}
                className={item.status === status.value ? 'secondary active' : 'secondary'}
                disabled={item.status === status.value}
              >
                {status.label}
              </button>
            ))}
            <button onClick={() => removeAssignment(item._id)} className="danger">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
