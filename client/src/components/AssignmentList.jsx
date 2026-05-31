import api from '../api.js';

function AssignmentList({ assignments, onUpdate, onDelete }) {
  const updateStatus = async (assignment, status) => {
    const response = await api.put(`/assignments/${assignment._id}`, { status });
    onUpdate(response.data);
  };

  const removeAssignment = async id => {
    await api.delete(`/assignments/${id}`);
    onDelete(id);
  };

  if (!assignments.length) {
    return <p>No assignments created yet. Add one above to start tracking.</p>;
  }

  return (
    <div className="assignment-grid">
      {assignments.map(item => (
        <div key={item._id} className="assignment-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <h3>{item.title}</h3>
            <span className="meta">{item.status}</span>
          </div>
          <p className="meta">Student: {item.studentName || 'Unassigned'}</p>
          {item.description && <p>{item.description}</p>}
          <p className="meta">Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button onClick={() => updateStatus(item, 'pending')} className="secondary">Pending</button>
            <button onClick={() => updateStatus(item, 'in progress')} className="secondary">In Progress</button>
            <button onClick={() => updateStatus(item, 'completed')} className="secondary">Completed</button>
            <button onClick={() => removeAssignment(item._id)} className="danger">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
