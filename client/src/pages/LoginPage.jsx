import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset } from '../services/authService';
import { useToast } from '../components/common/Toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(cleanEmail, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name || 'User'}!`, 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('[LoginPage] Login error:', error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@taskflow.com');
    setPassword('Demo@12345');
    try {
      setLoading(true);
      const res = await login('demo@taskflow.com', 'Demo@12345');
      if (res.success) {
        addToast('Logged in as Demo Admin!', 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('[LoginPage] Demo login error:', error);
      const msg = error.response?.data?.message || 'Demo login failed. Please ensure the server is running.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      setForgotLoading(true);
      const res = await requestPasswordReset(forgotEmail);
      addToast(res.message, 'info');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (error) {
      addToast('Password reset request failed', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card-base"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: '16px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981, #3B82F6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            <Layers size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign in to TASKFLOW</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Plan better. Work together. Get things done.
          </p>
        </div>

        {/* Demo Account Banner */}
        <div
          onClick={handleDemoLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="#10B981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10B981' }}>
                Instant Demo Login
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                demo@taskflow.com | Demo@12345
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#10B981" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.8rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create one
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <KeyRound size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reset Password</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Enter your account email address below and we'll send you password recovery instructions.
              </p>
              <form onSubmit={handleForgotSubmit}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={forgotLoading}>
                    Send Instructions
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
