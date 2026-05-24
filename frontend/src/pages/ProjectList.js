import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '' });
      toast.success('Project created! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <span style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Loading projects...</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Projects</h1>
          <p>Manage and track all your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{projects.length}</span>
          <span style={{ color: 'var(--text2)' }}>Total Projects</span>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--success)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {projects.filter(p => p.admin._id === user._id || p.admin === user._id).length}
          </span>
          <span style={{ color: 'var(--text2)' }}>As Admin</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start managing tasks with your team.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowModal(true)}>
            + Create First Project
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
              <div className="project-name">{p.name}</div>
              <div className="project-desc">{p.description || 'No description provided.'}</div>
              <div className="project-footer">
                <span className="project-members">👥 {p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
                <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>
                  {p.members.find(m => m.user._id === user._id || m.user === user._id)?.role || 'Member'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Project</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
