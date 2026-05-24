import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
  const [creatingTask, setCreatingTask] = useState(false);

  const isAdmin = project?.members?.find(m => m.user._id === user._id || m.user === user._id)?.role === 'Admin';

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const res = await api.post('/tasks', { ...taskForm, projectId: id });
      setTasks([res.data, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      toast.success(`Moved to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data);
      setMemberEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const getPriorityClass = (p) => ({ High: 'badge-high', Medium: 'badge-med', Low: 'badge-low' }[p] || 'badge-low');

  const columns = [
    { key: 'To Do', label: 'To Do', colorClass: 'badge-todo' },
    { key: 'In Progress', label: 'In Progress', colorClass: 'badge-inprog' },
    { key: 'Done', label: 'Done', colorClass: 'badge-done' },
  ];

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <span style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Loading project...</span>
    </div>
  );

  return (
    <div>
      <Link to="/projects" className="back-link">← Back to Projects</Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1>{project?.name}</h1>
          <p>{project?.description || 'No description'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/projects/${id}/dashboard`)}>
            📊 Dashboard
          </button>
          {isAdmin && (
            <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)}>
              👥 Members ({project?.members?.length})
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* Task count bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {columns.map(col => (
          <div key={col.key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <span className={`badge ${col.colorClass}`}>{tasks.filter(t => t.status === col.key).length}</span>
            <span style={{ color: 'var(--text2)' }}>{col.label}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        {columns.map(col => (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col.label}</span>
              <span className="kanban-count">{tasks.filter(t => t.status === col.key).length}</span>
            </div>

            {tasks.filter(t => t.status === col.key).map(task => (
              <div key={task._id} className="task-card">
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-desc">{task.description}</div>}

                <div className="task-meta">
                  <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                  {task.assignedTo && (
                    <div className="task-assignee">
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--accent)' }}>
                        {getInitials(task.assignedTo.name)}
                      </div>
                      {task.assignedTo.name.split(' ')[0]}
                    </div>
                  )}
                  {task.dueDate && (
                    <span className="task-due">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="task-actions">
                  {columns.filter(c => c.key !== col.key).map(c => (
                    <button key={c.key} className="btn btn-ghost btn-sm"
                      onClick={() => handleUpdateStatus(task._id, c.key)}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                      → {c.label}
                    </button>
                  ))}
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteTask(task._id)}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {tasks.filter(t => t.status === col.key).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text3)', fontSize: '0.82rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px', opacity: 0.4 }}>
                  {col.key === 'To Do' ? '📝' : col.key === 'In Progress' ? '⚙️' : '✅'}
                </div>
                No tasks here
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Task</span>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="What needs to be done?" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} placeholder="Add more details..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project?.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingTask}>
                  {creatingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Manage Members</span>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Add Member by Email</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@email.com" required style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-primary" disabled={addingMember} style={{ flexShrink: 0 }}>
                    {addingMember ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>

            <div className="members-list">
              {project?.members?.map(m => (
                <div key={m.user._id} className="member-item">
                  <div className="member-left">
                    <div className="member-avatar">
                      {m.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="member-name">{m.user.name}</div>
                      <div className="member-email">{m.user.email}</div>
                    </div>
                  </div>
                  <div className="member-right">
                    <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                    {m.user._id !== user._id && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user._id)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
