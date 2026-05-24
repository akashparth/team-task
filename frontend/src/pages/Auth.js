import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleToggle = () => {
    setToggling(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setForm({ name: '', email: '', password: '' });
      setToggling(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      } else {
        if (form.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signup(form.name, form.email, form.password);
        toast.success('Account created! 🎉');
      }
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? 'Login failed' : 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-root ${theme}`}>
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>

      <button className="auth-theme-pill" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="auth-scene">
        <div className="auth-brand">
          <div className="brand-logo-3d">
            <div className="logo-cube">
              <div className="cube-face cube-front">⚡</div>
              <div className="cube-face cube-back">⚡</div>
              <div className="cube-face cube-left"></div>
              <div className="cube-face cube-right"></div>
              <div className="cube-face cube-top"></div>
              <div className="cube-face cube-bottom"></div>
            </div>
          </div>
          <h1 className="brand-name">TaskFlow</h1>
          <p className="brand-tagline">Where teams get things done</p>
          <div className="brand-features">
            {[
              { icon: '📋', text: 'Kanban task boards' },
              { icon: '👥', text: 'Team collaboration' },
              { icon: '📊', text: 'Live analytics' },
              { icon: '🔒', text: 'Secure & fast' },
            ].map((f, i) => (
              <div className="brand-feature" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="brand-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="floating-card fc-1">
            <div className="fc-dot fc-green"></div>
            <span>Design System</span>
            <span className="fc-badge">Done</span>
          </div>
          <div className="floating-card fc-2">
            <div className="fc-dot fc-yellow"></div>
            <span>API Integration</span>
            <span className="fc-badge fc-badge-prog">In Progress</span>
          </div>
          <div className="floating-card fc-3">
            <div className="fc-dot fc-purple"></div>
            <span>3 tasks due today</span>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className={`auth-card-3d ${toggling ? 'card-toggling' : ''}`}>
            <div className="jelly-toggle-wrap">
              <div className={`jelly-toggle ${isLogin ? 'jelly-left' : 'jelly-right'}`} onClick={handleToggle}>
                <div className="jelly-knob"></div>
                <span className={`jelly-label jelly-label-left ${isLogin ? 'jelly-active' : ''}`}>Sign In</span>
                <span className={`jelly-label jelly-label-right ${!isLogin ? 'jelly-active' : ''}`}>Sign Up</span>
              </div>
            </div>

            <div className="auth-form-header">
              <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
              <p>{isLogin ? 'Sign in to continue to TaskFlow' : 'Start managing tasks for free'}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="af-group">
                  <label>Full Name</label>
                  <div className="af-input-wrap">
                    <span className="af-icon">👤</span>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Aditya Kumar" required />
                  </div>
                </div>
              )}
              <div className="af-group">
                <label>Email Address</label>
                <div className="af-input-wrap">
                  <span className="af-icon">✉️</span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
                </div>
              </div>
              <div className="af-group">
                <label>Password</label>
                <div className="af-input-wrap">
                  <span className="af-icon">🔒</span>
                  <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={isLogin ? 'Your password' : 'Min. 6 characters'} required />
                </div>
              </div>
              <button type="submit" className="af-submit" disabled={loading}>
                {loading ? <span className="af-spinner"></span> : <>{isLogin ? 'Sign In' : 'Create Account'} →</>}
              </button>
            </form>

            <p className="auth-switch-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button className="auth-switch-btn" onClick={handleToggle}>
                {isLogin ? ' Sign up free' : ' Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}