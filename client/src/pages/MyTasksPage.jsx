import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchTasks, updateTaskApi } from '../services/taskService';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { TaskModal } from '../components/kanban/TaskModal';
import { useToast } from '../components/common/Toast';

export const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'COMPLETED'
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { addToast } = useToast();

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const res = await fetchTasks({ myTasks: 'true' });
      if (res.success) setTasks(res.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  const handleStatusQuickChange = async (taskId, newStatus) => {
    try {
      const res = await updateTaskApi(taskId, { status: newStatus });
      if (res.success) {
        addToast('Task status updated', 'success');
        setTasks(tasks.map((t) => (t._id === taskId ? res.task : t)));
      }
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  const overdueList = tasks.filter((t) => isOverdue(t.dueDate, t.status));
  const completedList = tasks.filter((t) => t.status === 'DONE');
  const upcomingList = tasks.filter((t) => t.status !== 'DONE' && !isOverdue(t.dueDate, t.status));

  let displayTasks = tasks;
  if (activeTab === 'OVERDUE') displayTasks = overdueList;
  if (activeTab === 'COMPLETED') displayTasks = completedList;
  if (activeTab === 'UPCOMING') displayTasks = upcomingList;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Tasks</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Overview of all tasks assigned to you across projects.
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`btn ${activeTab === 'OVERDUE' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ position: 'relative' }}
        >
          Overdue ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`btn ${activeTab === 'UPCOMING' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Upcoming ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`btn ${activeTab === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({completedList.length})
        </button>
      </div>

      {/* Tasks Table / Cards */}
      {displayTasks.length === 0 ? (
        <div className="card-base" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckSquare size={44} style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h3>No tasks in this view</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayTasks.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);

            return (
              <div
                key={t._id}
                onClick={() => {
                  setSelectedTask(t);
                  setIsTaskModalOpen(true);
                }}
                className="card-base card-hover"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderLeft: `5px solid ${t.project?.color || '#10B981'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusQuickChange(t._id, e.target.checked ? 'DONE' : 'IN_PROGRESS');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        textDecoration: t.status === 'DONE' ? 'line-through' : 'none',
                        opacity: t.status === 'DONE' ? 0.6 : 1,
                      }}
                    >
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: {t.project?.name || 'General'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: overdue ? '#EF4444' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Clock size={14} /> {formatDate(t.dueDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projectId={selectedTask?.project?._id || selectedTask?.project}
        onTaskUpdated={() => loadMyTasks()}
        onTaskDeleted={() => loadMyTasks()}
      />
    </div>
  );
};
