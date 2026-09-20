import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../services/notificationService';
import { formatTimeAgo } from '../utils/dateUtils';
import { useToast } from '../components/common/Toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications();
      if (res.success) setNotifications(res.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'success');
    } catch (e) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleClickNotif = async (n) => {
    if (!n.read) {
      try {
        await markNotificationReadApi(n._id);
        setNotifications(notifications.map((item) => (item._id === n._id ? { ...item, read: true } : item)));
      } catch (e) {}
    }

    if (n.relatedProject) {
      navigate(`/projects/${n.relatedProject._id || n.relatedProject}`);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Notification Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Stay up to date with task updates, comments, and project invites.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={18} /> Mark All Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="card-base" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={44} style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h3>No notifications yet</h3>
          <p style={{ fontSize: '0.9rem' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotif(n)}
              className="card-base card-hover"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: n.read ? 'var(--bg-card)' : 'var(--primary-light)',
                borderLeft: n.read ? '1px solid var(--border-color)' : '4px solid var(--primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <img
                  src={
                    n.sender?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender?.name || 'User'}`
                  }
                  alt="Sender"
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.92rem' }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {formatTimeAgo(n.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
