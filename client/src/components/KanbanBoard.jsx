import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'pending', title: '⏳ Pending', status: 'pending' },
  { id: 'in progress', title: '🚀 In Progress', status: 'in progress' },
  { id: 'completed', title: '✅ Completed', status: 'completed' },
];

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function KanbanBoard({ assignments, onStatusChange, onEdit, onDelete }) {
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const assignment = assignments.find(a => a._id === draggableId);
      if (assignment) {
        onStatusChange(assignment, destination.droppableId);
      }
    }
  };

  const getAssignmentsByStatus = (status) => {
    return assignments.filter(a => a.status === status);
  };

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        {COLUMNS.map(column => {
          const colAssignments = getAssignmentsByStatus(column.status);
          
          return (
            <div className="kanban-column" key={column.id}>
              <h3 className="kanban-column-title">
                {column.title} 
                <span className="kanban-count">{colAssignments.length}</span>
              </h3>
              
              <Droppable droppableId={column.status}>
                {(provided, snapshot) => (
                  <div
                    className={`kanban-droppable ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {colAssignments.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index} isDragDisabled={item.submitted}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''} ${item.submitted ? 'is-submitted' : ''}`}
                            style={{...provided.draggableProps.style}}
                          >
                            <div className={`kanban-card__strip strip--${item.status.replace(' ', '-')}`} />
                            <div className="kanban-card__body">
                              <h4 className="kanban-card-title">{item.title}</h4>
                              <p className="kanban-card-meta">👤 {item.studentName || 'Unassigned'}</p>
                              
                              {item.description && (
                                <p className="kanban-card-desc">{item.description}</p>
                              )}
                              
                              <div className="kanban-card-footer">
                                <span className="kanban-date">📅 {formatDate(item.dueDate)}</span>
                                <div className="kanban-actions">
                                  {!item.submitted && (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} title="Edit">✏️</button>
                                      <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(item._id); }} title="Delete">🗑️</button>
                                    </>
                                  )}
                                  {item.submitted && <span title="Submitted" className="kanban-submitted-lock">🔒</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
