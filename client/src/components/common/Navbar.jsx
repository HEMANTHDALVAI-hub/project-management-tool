import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Layers,
  CheckSquare,
  Circle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { fetchNotifications, markAllNotificationsReadApi, markNotificationReadApi } from '../../services/notificationService';
import { fetchTasks } from '../../services/taskService';
import { fetchProjects } from '../../services/projectService';
import { formatTimeAgo } from '../../utils/dateUtils';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, socket } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotif);
    return () => {
      socket.off('notification:new', handleNewNotif);
    };
  }, [socket]);

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search API Call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ tasks: [], projects: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [taskRes, projRes] = await Promise.all([
          fetchTasks({ search: searchQuery }),
          fetchProjects(),
        ]);
        const matchedProjects = (projRes.projects || []).filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults({
          tasks: (taskRes.tasks || []).slice(0, 5),
          projects: matchedProjects.slice(0, 5),
        });
        setShowSearchResults(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationReadApi(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
    setShowNotifMenu(false);
    if (notif.relatedProject) {
      navigate(`/projects/${notif.relatedProject._id || notif.relatedProject}`);
    }
  };

  return (
    <header className="header-glass">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1.5rem',
          gap: '1rem',
        }}
      >
        {/* Left Section: Logo & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleSidebar}
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.4rem',
              borderRadius: '6px',
            }}
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>

          <RouterLink
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Layers size={20} />
            </div>
            <span>TASKFLOW</span>
          </RouterLink>

          {/* Live Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isConnected ? '#10b981' : '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#ef4444',
                boxShadow: isConnected ? '0 0 6px #10b981' : 'none',
              }}
            ></span>
            {isConnected ? '● Live' : 'Offline'}
          </div>
        </div>

        {/* Center Section: Global Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search projects, tasks, members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchResults(true);
              }}
              className="form-input"
              style={{
                paddingLeft: '2.4rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-input)',
              }}
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '380px',
                overflowY: 'auto',
                zIndex: 60,
                padding: '0.5rem',
              }}
            >
              {searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching projects or tasks found
                </div>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase' }}>
                        Projects
                      </div>
                      {searchResults.projects.map((proj) => (
                        <div
                          key={proj._id}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            navigate(`/projects/${proj._id}`);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: proj.color || '#10B981' }}></div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{proj.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase' }}>
                        Tasks
                      </div>
                      {searchResults.tasks.map((t) => (
                        <div
                          key={t._id}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            navigate(`/projects/${t.project._id || t.project}`);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <CheckSquare size={16} color="var(--primary)" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.project?.name}</div>
                          </div>
                          <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
          </button>

          {/* Notification Bell Dropdown */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu((prev) => !prev)}
              style={{
                position: 'relative',
                padding: '0.5rem',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-card)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '340px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 70,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotifClick(n)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: n.read ? 'transparent' : 'var(--primary-light)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {formatTimeAgo(n.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <RouterLink
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  style={{
                    display: 'block',
                    padding: '0.6rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  View all notifications
                </RouterLink>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                alt={user?.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.875rem', paddingRight: '0.4rem' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '200px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 70,
                  padding: '0.5rem 0',
                }}
              >
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>

                <RouterLink
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <User size={16} /> Profile & Settings
                </RouterLink>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    color: '#ef4444',
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
