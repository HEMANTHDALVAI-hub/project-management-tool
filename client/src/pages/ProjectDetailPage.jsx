import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  UserPlus,
  Plus,
  Activity as ActivityIcon,
  Settings,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';
import { fetchProjectById, updateProjectApi, fetchProjectActivities } from '../services/projectService';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/kanban/TaskModal';
import { MemberModal } from '../components/projects/MemberModal';
import { formatTimeAgo, formatDate } from '../utils/dateUtils';
import { useToast } from '../components/common/Toast';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'activity' | 'settings'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Project Settings form state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#10B981');

  const loadProjectData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setError(null);
      const res = await fetchProjectById(id);
      if (res.success && res.project) {
        setProject(res.project);
        setTasks(res.project.tasks || []);
        setEditName(res.project.name || '');
        setEditDesc(res.project.description || '');
        setEditColor(res.project.color || '#10B981');
      } else {
        setError(res.message || 'Unable to load project details.');
      }
    } catch (e) {
      console.error('[ProjectDetailPage] Error loading project:', e);
      const errMsg = e.response?.data?.message || 'Unable to load project details. Please try again.';
      setError(errMsg);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await fetchProjectActivities(id);
      if (res.success) setActivities(res.activities);
    } catch (e) {}
  };

  useEffect(() => {
    setProject(null);
    setError(null);
    loadProjectData(true);
    loadActivities();
  }, [id]);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev.filter((t) => t._id !== newTask._id)]);
    loadProjectData(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    loadProjectData(false);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    loadProjectData(false);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>
          Unable to load project details.
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          {error || 'The requested project could not be found or you do not have permission to view it.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/projects')} className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <button onClick={() => loadProjectData(true)} className="btn btn-primary">
            Please try again.
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProjectSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProjectApi(project._id, {
        name: editName,
        description: editDesc,
        color: editColor,
      });
      if (res.success) {
        setProject({ ...project, ...res.project });
        addToast('Project settings updated!', 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Back Button & Top Navigation */}
      <button
        onClick={() => navigate('/projects')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Banner Header */}
      <div
        className="card-base"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderLeft: `6px solid ${project.color || '#10B981'}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{project.name}</h1>
              <span className="badge badge-low" style={{ textTransform: 'capitalize' }}>
                Role: {project.userRole || 'MEMBER'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '700px' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setIsMemberModalOpen(true)} className="btn btn-secondary">
              <UserPlus size={18} /> Team Members ({project.members?.length || 0})
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

        {/* Member Avatar Stack & Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Members:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {project.members?.map((m, idx) => {
                const u = m.user || m;
                return (
                  <img
                    key={idx}
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || 'User'}`}
                    alt={u.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid var(--bg-card)',
                      marginLeft: idx > 0 ? '-8px' : 0,
                    }}
                    title={`${u.name} (${m.role})`}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '320px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Progress: {project.progress || 0}%
            </span>
            <div
              style={{
                flex: 1,
                height: '8px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${project.progress || 0}%`,
                  backgroundColor: project.color || '#10B981',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('board')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'board' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'board' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          <FolderKanban size={18} /> Kanban Board
        </button>

        <button
          onClick={() => {
            setActiveTab('activity');
            loadActivities();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'activity' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          <ActivityIcon size={18} /> Recent Activity
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'settings' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* TAB 1: Kanban Board */}
      {activeTab === 'board' && (
        <KanbanBoard
          tasks={tasks}
          projectId={project._id}
          projectMembers={project.members || []}
          onOpenTaskModal={(t) => {
            setSelectedTask(t);
            setIsTaskModalOpen(true);
          }}
          onTaskChange={() => loadProjectData(false)}
        />
      )}

      {/* TAB 2: Activity Stream */}
      {activeTab === 'activity' && (
        <div className="card-base" style={{ padding: '1.5rem', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Project Activity Log</h3>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No activities logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map((a) => (
                <div key={a._id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <img
                    src={a.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.user?.name || 'User'}`}
                    alt={a.user?.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <div>
                    <div>
                      <strong>{a.user?.name}</strong> {a.action} <strong>"{a.target}"</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatTimeAgo(a.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Project Settings */}
      {activeTab === 'settings' && (
        <div className="card-base" style={{ padding: '1.5rem', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Project Settings</h3>
          <form onSubmit={handleUpdateProjectSettings}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Accent Color</label>
              <input
                type="color"
                className="form-input"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                style={{ height: '42px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projectId={project._id}
        projectMembers={project.members || []}
        onTaskCreated={(newTask) => handleTaskCreated(newTask)}
        onTaskUpdated={(updatedTask) => handleTaskUpdated(updatedTask)}
        onTaskDeleted={(taskId) => handleTaskDeleted(taskId)}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        project={project}
        onProjectUpdated={(updated) => setProject(updated)}
      />
    </div>
  );
};
