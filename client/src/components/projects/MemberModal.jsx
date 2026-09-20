import React, { useState } from 'react';
import { X, UserPlus, Trash2, Shield, UserCheck } from 'lucide-react';
import { addProjectMemberApi, removeProjectMemberApi } from '../../services/projectService';
import { useToast } from '../common/Toast';

export const MemberModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  if (!isOpen || !project) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter user email', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await addProjectMemberApi(project._id, email.trim(), role);
      if (res.success) {
        addToast(res.message, 'success');
        onProjectUpdated(res.project);
        setEmail('');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;

    try {
      const res = await removeProjectMemberApi(project._id, userId);
      if (res.success) {
        addToast('Member removed', 'info');
        onProjectUpdated(res.project);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Project Team Members</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Invite New Member
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                className="form-input"
                placeholder="colleague@taskflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '110px' }}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Members List */}
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Current Members ({project.members?.length || 0})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
            {project.members?.map((m) => {
              const u = m.user || {};
              const isOwner = project.owner?._id === u._id || project.owner === u._id;

              return (
                <div
                  key={u._id || Math.random()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || 'User'}`}
                      alt={u.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isOwner ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-hover)',
                        color: isOwner ? '#10B981' : 'var(--text-secondary)',
                      }}
                    >
                      {isOwner ? 'OWNER' : m.role}
                    </span>

                    {!isOwner && (
                      <button
                        onClick={() => handleRemoveMember(u._id, u.name)}
                        style={{ color: '#ef4444', opacity: 0.8 }}
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
