import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Bell,
  Settings,
  Plus,
  ChevronLeft,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onToggle, onOpenNewProjectModal }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: isOpen ? '240px' : '70px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 30,
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: '60px',
      }}
    >
      {/* Quick Action CTA */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={onOpenNewProjectModal}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: isOpen ? 'center' : 'center',
            padding: isOpen ? '0.65rem 1rem' : '0.65rem 0',
          }}
          title="New Project"
        >
          <Plus size={18} />
          {isOpen && <span>New Project</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0.5rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                marginBottom: '0.25rem',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              })}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Collapse Toggle Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'flex-end' : 'center',
            color: 'var(--text-muted)',
            padding: '0.4rem',
          }}
        >
          <ChevronLeft
            size={20}
            style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.25s',
            }}
          />
        </button>
      </div>
    </aside>
  );
};
