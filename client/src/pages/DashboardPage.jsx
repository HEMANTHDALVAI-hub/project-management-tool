import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { fetchProjects } from '../services/projectService';
import { fetchTasks } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { TaskModal } from '../components/kanban/TaskModal';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, taskRes] = await Promise.all([
        fetchProjects().catch((err) => ({ success: false, projects: [], error: err })),
        fetchTasks({ myTasks: 'true' }).catch((err) => ({ success: false, tasks: [], error: err })),
      ]);
      
      if (projRes && projRes.success) setProjects(projRes.projects || []);
      if (taskRes && taskRes.success) setTasks(taskRes.tasks || []);

      if (!projRes?.success && !taskRes?.success) {
        setError('Unable to load your dashboard data. Please check your connection and try again.');
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError('Unable to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const safeProjects = projects || [];
  const safeTasks = tasks || [];

  const totalProjects = safeProjects.length;
  const myTotalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter((t) => t && t.status === 'DONE').length;
  const overdueTasks = safeTasks.filter((t) => t && isOverdue(t.dueDate, t.status)).length;

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '1rem' }}>
          {error}
        </div>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header & Quick Action Buttons */}
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your workload overview and project progress for today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsProjectModalOpen(true)} className="btn btn-secondary">
            <Plus size={18} /> New Project
          </button>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Stat Cards Overview Grid */}
      <div className="grid-cols-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card-base" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Projects</span>
            <FolderKanban size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalProjects}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
            <TrendingUp size={14} /> Active workspaces
          </div>
        </div>

        <div className="card-base" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Assigned Tasks</span>
            <CheckSquare size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{myTotalTasks}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across all projects
          </div>
        </div>

        <div className="card-base" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Completed</span>
            <CheckSquare size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completedTasks}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.2rem' }}>
            {myTotalTasks > 0 ? Math.round((completedTasks / myTotalTasks) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="card-base" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Overdue</span>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overdueTasks > 0 ? '#EF4444' : 'inherit' }}>
            {overdueTasks}
          </div>
          <div style={{ fontSize: '0.75rem', color: overdueTasks > 0 ? '#EF4444' : 'var(--text-muted)', marginTop: '0.2rem' }}>
            {overdueTasks > 0 ? 'Requires immediate action' : 'All caught up!'}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Active Projects & My Tasks */}
      <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
        {/* Left Column (2 cols): My Assigned Tasks */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card-base" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Assigned Tasks</h3>
              <button
                onClick={() => navigate('/my-tasks')}
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tasks assigned to you right now 🎉
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.slice(0, 5).map((t) => {
                  const overdue = isOverdue(t.dueDate, t.status);
                  return (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, border-color 0.15s',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: t.project?.color || '#10B981',
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t.project?.name}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                        {t.dueDate && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: overdue ? '#EF4444' : 'var(--text-muted)',
                              fontWeight: overdue ? 700 : 500,
                            }}
                          >
                            {formatDate(t.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Project Progress Overview */}
        <div>
          <div className="card-base" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Overview</h3>
              <button
                onClick={() => navigate('/projects')}
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                All Projects <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: p.color || '#10B981' }}>
                      {p.progress || 0}%
                    </span>
                  </div>

                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${p.progress || 0}%`,
                        backgroundColor: p.color || '#10B981',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projectId={projects[0]?._id}
        projectMembers={projects[0]?.members || []}
        onTaskUpdated={() => loadDashboardData()}
        onTaskDeleted={() => loadDashboardData()}
      />

      {/* New Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects([newProj, ...projects]);
        }}
      />
    </div>
  );
};
