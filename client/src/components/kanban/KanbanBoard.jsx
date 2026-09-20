import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  CheckSquare,
  MessageSquare,
  Clock,
  Filter,
  User,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { updateTaskApi } from '../../services/taskService';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../common/Toast';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: '#64748B' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#3B82F6' },
  { id: 'REVIEW', title: 'Review', color: '#F59E0B' },
  { id: 'DONE', title: 'Done', color: '#10B981' },
];

const normalizeStatus = (s) => {
  if (!s) return 'TODO';
  const str = String(s).toUpperCase().trim().replace(/[-\s]/g, '_');
  if (str === 'TO_DO' || str === 'TODO') return 'TODO';
  if (str === 'INPROGRESS' || str === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (str === 'REVIEW') return 'REVIEW';
  if (str === 'DONE' || str === 'COMPLETED') return 'DONE';
  return str;
};

export const KanbanBoard = ({
  tasks: initialTasks = [],
  projectId,
  projectMembers = [],
  onOpenTaskModal,
  onTaskChange,
}) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [filterLabel, setFilterLabel] = useState('ALL');

  const { socket, joinProject, leaveProject } = useSocket();
  const { addToast } = useToast();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Real-time Socket.IO subscriptions for this project
  useEffect(() => {
    if (!projectId || !socket) return;

    joinProject(projectId);

    const handleCreated = (newTask) => {
      setTasks((prev) => (prev.some((t) => t._id === newTask._id) ? prev : [newTask, ...prev]));
    };

    const handleUpdated = (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    };

    const handleDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on('task:created', handleCreated);
    socket.on('task:updated', handleUpdated);
    socket.on('task:deleted', handleDeleted);

    return () => {
      socket.off('task:created', handleCreated);
      socket.off('task:updated', handleUpdated);
      socket.off('task:deleted', handleDeleted);
      leaveProject(projectId);
    };
  }, [projectId, socket]);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'ALL') {
      const assigneeId = t.assignee?._id || t.assignee;
      if (assigneeId !== filterAssignee) return false;
    }
    if (filterLabel !== 'ALL' && !t.labels?.includes(filterLabel)) return false;
    return true;
  });

  // Extract all unique labels
  const allLabels = Array.from(new Set(tasks.flatMap((t) => t.labels || [])));

  // Drag and Drop Handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Optimistic UI update
    const updatedTasks = tasks.map((t) => {
      if (t._id === draggableId) {
        return { ...t, status: destStatus };
      }
      return t;
    });

    setTasks(updatedTasks);

    try {
      const res = await updateTaskApi(draggableId, {
        status: destStatus,
        position: destination.index,
      });
      if (res.success && onTaskChange) {
        onTaskChange(res.task);
      }
    } catch (error) {
      addToast('Failed to update task position', 'error');
      // Revert optimistic update
      setTasks(initialTasks);
    }
  };

  return (
    <div>
      {/* Board Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <Filter size={18} color="var(--primary)" /> Filters:
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Priority Filter */}
          <select
            className="form-input"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: '130px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Assignee Filter */}
          <select
            className="form-input"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Assignees</option>
            {projectMembers.map((m) => {
              const u = m.user || m;
              return (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              );
            })}
          </select>

          {/* Label Filter */}
          {allLabels.length > 0 && (
            <select
              className="form-input"
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              style={{ width: '130px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Labels</option>
              {allLabels.map((lbl) => (
                <option key={lbl} value={lbl}>
                  {lbl}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Drag & Drop Board Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
          }}
        >
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => normalizeStatus(t.status) === col.id);

            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 240px)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid',
                    borderColor: col.color,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: col.color,
                      }}
                    />
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{col.title}</h4>
                  </div>

                  <span
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        minHeight: '150px',
                        backgroundColor: snapshot.isDraggingOver
                          ? 'var(--primary-light)'
                          : 'transparent',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {columnTasks.map((task, index) => {
                        const checklistTotal = task.checklist?.length || 0;
                        const checklistDone =
                          task.checklist?.filter((c) => c.completed).length || 0;
                        const overdue = isOverdue(task.dueDate, task.status);

                        return (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(draggableProvided, draggableSnapshot) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                {...draggableProvided.dragHandleProps}
                                onClick={() => onOpenTaskModal(task)}
                                className="card-base card-hover"
                                style={{
                                  padding: '1rem',
                                  cursor: 'pointer',
                                  boxShadow: draggableSnapshot.isDragging
                                    ? 'var(--shadow-xl)'
                                    : 'var(--shadow-sm)',
                                  ...draggableProvided.draggableProps.style,
                                }}
                              >
                                {/* Task Header: Labels & Priority */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {task.labels?.map((lbl) => (
                                      <span
                                        key={lbl}
                                        style={{
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          padding: '0.15rem 0.4rem',
                                          borderRadius: '4px',
                                          backgroundColor: 'var(--primary-light)',
                                          color: 'var(--primary)',
                                        }}
                                      >
                                        {lbl}
                                      </span>
                                    ))}
                                  </div>

                                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                  </span>
                                </div>

                                {/* Task Title */}
                                <h5
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    marginBottom: '0.4rem',
                                    color: 'var(--text-primary)',
                                  }}
                                >
                                  {task.title}
                                </h5>

                                {task.description && (
                                  <p
                                    style={{
                                      fontSize: '0.78rem',
                                      color: 'var(--text-secondary)',
                                      marginBottom: '0.75rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {task.description}
                                  </p>
                                )}

                                {/* Card Footer Stats */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {/* Due Date */}
                                    {task.dueDate && (
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.2rem',
                                          color: overdue ? '#ef4444' : 'inherit',
                                          fontWeight: overdue ? 700 : 500,
                                        }}
                                      >
                                        <Clock size={14} />
                                        <span>{formatDate(task.dueDate)}</span>
                                      </div>
                                    )}

                                    {/* Subtask Count */}
                                    {checklistTotal > 0 && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <CheckSquare size={14} />
                                        <span>
                                          {checklistDone}/{checklistTotal}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Assignee Avatar */}
                                  {task.assignee && (
                                    <img
                                      src={
                                        task.assignee.avatar ||
                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name || 'User'}`
                                      }
                                      alt={task.assignee.name}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                      }}
                                      title={`Assigned to ${task.assignee.name}`}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Column Quick Add */}
                <button
                  onClick={() => onOpenTaskModal({ status: col.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem',
                    marginTop: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: '1px dashed var(--border-color)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
