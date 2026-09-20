import React, { useState } from 'react';
import { User, Lock, Moon, Sun, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { name, bio };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Account & Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your account profile, credentials, and app preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Card Header */}
        <div className="card-base" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user?.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
            <span className="badge badge-low" style={{ marginTop: '0.4rem' }}>
              Role: {user?.role || 'User'}
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="card-base" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary)" /> Profile Details
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / About You</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Product Manager, UI Designer, Full Stack Developer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--primary)" /> Change Password
            </h3>

            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences & Theme Toggle Card */}
        <div className="card-base" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Appearance Preferences</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Theme Mode</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Switch between Professional Dark Mode and Clean Light Mode
              </div>
            </div>

            <button onClick={toggleTheme} className="btn btn-secondary">
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
