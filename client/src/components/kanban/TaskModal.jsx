import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Tag,
  CheckSquare,
  MessageSquare,
  Trash2,
  Edit2,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { createTaskApi, updateTaskApi, deleteTaskApi } from '../../services/taskService';
import { fetchTaskComments, addCommentApi, updateCommentApi, deleteCommentApi } from '../../services/commentService';
import { formatDate, formatTimeAgo, isOverdue } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

export const TaskModal = ({
  isOpen,
  onClose,
  task: initialTask,
  projectId,
  projectMembers = [],
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const isEditMode = !!initialTask?._id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [labels, setLabels] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newCheckitem, setNewCheckitem] = useState('');

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'TODO');
      setPriority(initialTask.priority || 'MEDIUM');
      setAssignee(initialTask.assignee?._id || initialTask.assignee || '');
      setDueDate(
        initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
      );
      setLabels(initialTask.labels || []);
      setChecklist(initialTask.checklist || []);

      if (initialTask._id) {
        loadComments(initialTask._id);
      } else {
        setComments([]);
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setAssignee('');
      setDueDate('');
      setLabels([]);
      setChecklist([]);
      setComments([]);
    }
  }, [initialTask]);

  const loadComments = async (taskId) => {
    try {
      const res = await fetchTaskComments(taskId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleAddLabel = () => {
    if (labelsInput.trim() && !labels.includes(labelsInput.trim())) {
      setLabels([...labels, labelsInput.trim()]);
      setLabelsInput('');
    }
  };

  const handleRemoveLabel = (lbl) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handleAddCheckitem = () => {
    if (newCheckitem.trim()) {
      setChecklist([...checklist, { text: newCheckitem.trim(), completed: false }]);
      setNewCheckitem('');
    }
  };

  const handleToggleCheckitem = (index) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const handleRemoveCheckitem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Task title is required', 'error');
      return;
    }

    const targetProjectId = initialTask?.project?._id || initialTask?.project || projectId;
    if (!targetProjectId) {
      addToast('Project ID is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignee || null,
        dueDate: dueDate || null,
        labels,
        checklist,
        project: targetProjectId,
      };

      let res;
      if (isEditMode) {
        res = await updateTaskApi(initialTask._id, payload);
      } else {
        res = await createTaskApi(payload);
      }

      if (res.success) {
        addToast(isEditMode ? 'Task updated successfully' : 'Task created successfully', 'success');
        if (isEditMode) {
          if (onTaskUpdated) onTaskUpdated(res.task);
        } else {
          if (onTaskCreated) onTaskCreated(res.task);
          else if (onTaskUpdated) onTaskUpdated(res.task);
        }
        onClose();
      }
    } catch (error) {
      console.error('Task submission error:', error);
      addToast(error.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTaskApi(initialTask._id);
      if (res.success) {
        addToast('Task deleted', 'info');
        onTaskDeleted(initialTask._id);
        onClose();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  // Comment Handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !initialTask?._id) return;
    try {
      const res = await addCommentApi(initialTask._id, newComment);
      if (res.success) {
        setComments([...comments, res.comment]);
        setNewComment('');
        addToast('Comment posted', 'success');
      }
    } catch (error) {
      addToast('Failed to post comment', 'error');
    }
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await updateCommentApi(commentId, editingCommentText);
      if (res.success) {
        setComments(comments.map((c) => (c._id === commentId ? res.comment : c)));
        setEditingCommentId(null);
      }
    } catch (e) {
      addToast('Failed to edit comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteCommentApi(commentId);
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        addToast('Comment deleted', 'info');
      }
    } catch (e) {
      addToast('Failed to delete comment', 'error');
    }
  };

  const completedChecklistCount = checklist.filter((c) => c.completed).length;
  const checklistPercent =
    checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px', height: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {status.replace('_', ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteTask}
                style={{ color: '#ef4444', padding: '0.4rem', borderRadius: '6px' }}
                title="Delete Task"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmitTask}
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Task Title */}
          <div>
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                fontSize: '1.35rem',
                fontWeight: 700,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>

          {/* Properties Grid */}
          <div
            className="grid-cols-2"
            style={{
              gap: '1rem',
              backgroundColor: 'var(--bg-input)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Status Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority</label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Assignee</label>
              <select
                className="form-input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => {
                  const u = m.user || m;
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                Due Date {isOverdue(dueDate, status) && <span style={{ color: '#ef4444' }}>(Overdue)</span>}
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Add extra context or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Labels & Tags */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={16} /> Labels & Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {lbl}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveLabel(lbl)} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bug, Frontend"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLabel();
                  }
                }}
              />
              <button type="button" onClick={handleAddLabel} className="btn btn-secondary">
                Add Label
              </button>
            </div>
          </div>

          {/* Subtask Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <CheckSquare size={16} /> Checklist ({completedChecklistCount} / {checklist.length})
              </label>
              {checklist.length > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {checklistPercent}%
                </span>
              )}
            </div>

            {/* Checklist Progress Bar */}
            {checklist.length > 0 && (
              <div
                style={{
                  height: '6px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${checklistPercent}%`,
                    backgroundColor: 'var(--primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {checklist.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.6rem',
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: '6px',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleCheckitem(index)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.6 : 1, fontSize: '0.85rem' }}>
                      {item.text}
                    </span>
                  </label>
                  <button type="button" onClick={() => handleRemoveCheckitem(index)} style={{ color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add subtask step..."
                value={newCheckitem}
                onChange={(e) => setNewCheckitem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckitem();
                  }
                }}
              />
              <button type="button" onClick={handleAddCheckitem} className="btn btn-secondary">
                Add Item
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>

        {/* Real-time Comments Section (Only in Edit Mode) */}
        {isEditMode && (
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={16} /> Comments ({comments.length})
            </h4>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={16} />
              </button>
            </form>

            {/* Comment Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
              {comments.map((c) => {
                const isAuthor = c.author?._id === user?.id || c.author === user?.id;
                return (
                  <div key={c._id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <img
                      src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.name || 'User'}`}
                      alt={c.author?.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-input)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700 }}>{c.author?.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTimeAgo(c.createdAt)}</span>
                      </div>
                      {editingCommentId === c._id ? (
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                          />
                          <button type="button" onClick={() => handleSaveEditComment(c._id)} className="btn btn-primary btn-sm">
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>{c.content}</div>
                      )}
                    </div>
                    {isAuthor && editingCommentId !== c._id && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        style={{ color: 'var(--text-muted)', alignSelf: 'center' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
