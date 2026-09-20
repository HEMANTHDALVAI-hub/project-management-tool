import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTasks } from '../services/taskService';
import { TaskModal } from '../components/kanban/TaskModal';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetchTasks();
      if (res.success) setTasks(res.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map tasks to dates
  const getTasksForDay = (day) => {
    const targetStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).toISOString().split('T')[0];
      return d === targetStr;
    });
  };

  const dayCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(d);
  }

  return (
    <div className="page-container">
      {/* Calendar Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Task Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Visual schedule of task due dates across projects.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handlePrevMonth} className="btn btn-secondary">
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '160px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="btn btn-secondary">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary">
            Today
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="card-base" style={{ padding: '1rem', overflowX: 'auto' }}>
        {/* Days of Week Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '0.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
          }}
        >
          {dayCells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    minHeight: '100px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '8px',
                    opacity: 0.3,
                  }}
                />
              );
            }

            const dayTasks = getTasksForDay(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${day}`}
                style={{
                  minHeight: '110px',
                  backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-input)',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.4rem', color: isToday ? 'var(--primary)' : 'inherit' }}>
                  {day}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto', flex: 1 }}>
                  {dayTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      style={{
                        padding: '0.25rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-card)',
                        borderLeft: `3px solid ${t.project?.color || '#10B981'}`,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projectId={selectedTask?.project?._id || selectedTask?.project}
        onTaskUpdated={() => loadTasks()}
        onTaskDeleted={() => loadTasks()}
      />
    </div>
  );
};
