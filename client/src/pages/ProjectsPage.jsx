import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, Users, Calendar, Trash2 } from 'lucide-react';
import { fetchProjects, deleteProjectApi } from '../services/projectService';
import { formatDate } from '../utils/dateUtils';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetchProjects();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteProject = async (e, projectId, projectName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"?`)) return;

    try {
      const res = await deleteProjectApi(projectId);
      if (res.success) {
        addToast('Project deleted', 'info');
        setProjects(projects.filter((p) => p._id !== projectId));
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage team projects, track status, and assign members.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          marginBottom: '1.5rem',
          position: 'relative',
          maxWidth: '380px',
        }}
      >
        <Search
          size={18}
          style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Filter projects by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div
          className="card-base"
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <FolderKanban size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h3>No projects found</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Create your first project to start organizing tasks with your team.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Create Project
          </button>
        </div>
      ) : (
        <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
          {filteredProjects.map((p) => {
            const isOwner = p.owner?._id === user?.id || p.owner === user?.id;

            return (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="card-base card-hover"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${p.color || '#10B981'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{p.name}</h3>
                    {isOwner && (
                      <button
                        onClick={(e) => handleDeleteProject(e, p._id, p.name)}
                        style={{ color: 'var(--text-muted)' }}
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      <span>Progress ({p.completedTasks || 0} / {p.totalTasks || 0} tasks)</span>
                      <span>{p.progress || 0}%</span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${p.progress || 0}%`,
                          backgroundColor: p.color || '#10B981',
                        }}
                      />
                    </div>
                  </div>

                  {/* Members & Due Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '-0.4rem' }}>
                      {p.members?.slice(0, 4).map((m, idx) => {
                        const u = m.user || m;
                        return (
                          <img
                            key={idx}
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || 'User'}`}
                            alt={u.name}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: '2px solid var(--bg-card)',
                              marginLeft: idx > 0 ? '-8px' : 0,
                            }}
                          />
                        );
                      })}
                    </div>

                    {p.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} />
                        <span>{formatDate(p.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects([newProj, ...projects]);
        }}
      />
    </div>
  );
};
