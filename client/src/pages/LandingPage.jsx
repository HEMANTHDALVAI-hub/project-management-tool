import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Zap,
  Users,
  Brain,
  Code,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  const demoColumns = [
    {
      title: 'To Do',
      tasks: [
        { name: 'Learn Python for Machine Learning', priority: 'MEDIUM' },
        { name: 'Complete NumPy & Pandas Practice', priority: 'HIGH' },
        { name: 'Study Probability & Statistics', priority: 'LOW' },
      ],
    },
    {
      title: 'In Progress',
      tasks: [
        { name: 'Build ML Prediction Model', priority: 'URGENT' },
        { name: 'DSA Problem Set', priority: 'HIGH' },
        { name: 'Computer Vision Mini Project', priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Review',
      tasks: [
        { name: 'ML Model Evaluation', priority: 'HIGH' },
        { name: 'Python Project Code Review', priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Done',
      tasks: [
        { name: 'Python Fundamentals', priority: 'MEDIUM' },
        { name: 'Data Visualization Project', priority: 'HIGH' },
        { name: 'Git & GitHub Basics', priority: 'LOW' },
      ],
    },
  ];

  const features = [
    {
      icon: Brain,
      color: '#10B981',
      title: '🧠 AI/ML Projects',
      description: 'Organize machine-learning projects, experiments and development tasks.',
    },
    {
      icon: Code,
      color: '#3B82F6',
      title: '💻 Coding Tasks',
      description: 'Track Python, C++, DSA and software-development work.',
    },
    {
      icon: BookOpen,
      color: '#8B5CF6',
      title: '📚 Learning Goals',
      description: 'Manage courses, assignments and study milestones.',
    },
    {
      icon: BarChart3,
      color: '#EC4899',
      title: '📊 Progress Tracking',
      description: 'Monitor project and learning progress from one dashboard.',
    },
    {
      icon: Users,
      color: '#F59E0B',
      title: '🤝 Team Collaboration',
      description: 'Assign tasks and communicate with project teammates.',
    },
    {
      icon: Zap,
      color: '#06B6D4',
      title: '⚡ Real-Time Updates',
      description: 'Keep everyone synchronized when tasks and projects change.',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* SaaS Landing Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.3rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Layers size={22} />
            </div>
            <span>TASKFLOW</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Dark/Light Theme Toggle */}
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

            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} /> Modern team collaboration platform
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: 'var(--text-primary)',
          }}
        >
          Plan better. Work together. <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #10B981, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Get things done.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          TaskFlow is a modern project-management and collaboration platform for students, developers, and AI/ML teams.
          Organize projects, track coding milestones, and collaborate seamlessly in real time.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Try Demo Account
          </Link>
        </div>
      </section>

      {/* Live Kanban Preview Card */}
      <section style={{ maxWidth: '1150px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div
          className="card-base"
          style={{
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Board Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem' }}>AI/ML Learning & Project Hub</h3>
            </div>
            <span className="badge badge-low" style={{ textTransform: 'none', fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              ● 4 ACTIVE TEAM MEMBERS
            </span>
          </div>

          {/* Kanban Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
              gap: '1rem',
              overflowX: 'auto',
            }}
          >
            {demoColumns.map((col) => (
              <div
                key={col.title}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--text-secondary)', paddingBottom: '0.2rem' }}>
                  {col.title} ({col.tasks.length})
                </div>

                {col.tasks.map((task) => (
                  <div
                    key={task.name}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                      {task.priority}
                    </span>
                    <div style={{ fontWeight: 700, marginTop: '0.4rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                      {task.name}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI/ML Relevant Features Grid */}
      <section style={{ maxWidth: '1150px', margin: '0 auto 6rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Built for Developers & AI/ML Teams
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Streamline your machine-learning workflows, DSA practice, and team project milestones.
          </p>
        </div>

        <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="card-base card-hover"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: `${feat.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={feat.color} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to organize your projects?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Join developers, students, and agile teams building better software together.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Try Demo Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p>© 2026 TASKFLOW. Plan better. Work together. Get things done.</p>
      </footer>
    </div>
  );
};
