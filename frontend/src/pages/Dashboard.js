import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/dashboard/${id}`),
      api.get(`/projects/${id}`)
    ]).then(([dashRes, projRes]) => {
      setData(dashRes.data);
      setProject(projRes.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  const total = data?.totalTasks || 0;
  const done = data?.byStatus?.['Done'] || 0;
  const inProg = data?.byStatus?.['In Progress'] || 0;
  const todo = data?.byStatus?.['To Do'] || 0;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (completion / 100) * circumference;

  return (
    <div className="dash-root">
      {/* Header */}
      <div className="dash-header">
        <div>
          <Link to={`/projects/${id}`} className="dash-back">← Back to Board</Link>
          <h1 className="dash-title">{project?.name}</h1>
          <p className="dash-subtitle">Project Analytics Dashboard</p>
        </div>
        <div className="dash-header-right">
          <div className="dash-live-badge">
            <span className="dash-live-dot"></span>
            Live
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card dash-stat-total">
          <div className="dash-stat-icon">📋</div>
          <div className="dash-stat-val">{total}</div>
          <div className="dash-stat-label">Total Tasks</div>
          <div className="dash-stat-bg-text">TASKS</div>
        </div>
        <div className="dash-stat-card dash-stat-todo">
          <div className="dash-stat-icon">📝</div>
          <div className="dash-stat-val">{todo}</div>
          <div className="dash-stat-label">To Do</div>
          <div className="dash-stat-bg-text">TODO</div>
        </div>
        <div className="dash-stat-card dash-stat-prog">
          <div className="dash-stat-icon">⚙️</div>
          <div className="dash-stat-val">{inProg}</div>
          <div className="dash-stat-label">In Progress</div>
          <div className="dash-stat-bg-text">ACTIVE</div>
        </div>
        <div className="dash-stat-card dash-stat-done">
          <div className="dash-stat-icon">✅</div>
          <div className="dash-stat-val">{done}</div>
          <div className="dash-stat-label">Completed</div>
          <div className="dash-stat-bg-text">DONE</div>
        </div>
        <div className="dash-stat-card dash-stat-overdue">
          <div className="dash-stat-icon">⚠️</div>
          <div className="dash-stat-val">{data?.overdueCount || 0}</div>
          <div className="dash-stat-label">Overdue</div>
          <div className="dash-stat-bg-text">LATE</div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="dash-main-grid">

        {/* Completion Ring */}
        <div className="dash-card dash-ring-card">
          <h3 className="dash-card-title">Overall Progress</h3>
          <div className="dash-ring-wrap">
            <svg viewBox="0 0 120 120" className="dash-ring-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--ring-bg)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="var(--ring-color)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="dash-ring-center">
              <span className="dash-ring-pct">{completion}%</span>
              <span className="dash-ring-sub">Complete</span>
            </div>
          </div>
          <div className="dash-ring-legend">
            {[
              { label: 'Done', val: done, color: 'var(--c-done)' },
              { label: 'In Progress', val: inProg, color: 'var(--c-prog)' },
              { label: 'To Do', val: todo, color: 'var(--c-todo)' },
            ].map(item => (
              <div key={item.label} className="dash-legend-item">
                <div className="dash-legend-dot" style={{ background: item.color }}></div>
                <span className="dash-legend-label">{item.label}</span>
                <span className="dash-legend-val">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="dash-card dash-bars-card">
          <h3 className="dash-card-title">Task Distribution</h3>
          <div className="dash-bars">
            {[
              { label: 'To Do', val: todo, color: 'var(--c-todo)', max: total },
              { label: 'In Progress', val: inProg, color: 'var(--c-prog)', max: total },
              { label: 'Done', val: done, color: 'var(--c-done)', max: total },
              { label: 'Overdue', val: data?.overdueCount || 0, color: 'var(--c-overdue)', max: total },
            ].map(item => (
              <div key={item.label} className="dash-bar-row">
                <div className="dash-bar-label">{item.label}</div>
                <div className="dash-bar-track">
                  <div className="dash-bar-fill" style={{
                    width: item.max > 0 ? `${(item.val / item.max) * 100}%` : '0%',
                    background: item.color
                  }}></div>
                </div>
                <div className="dash-bar-num">{item.val}</div>
              </div>
            ))}
          </div>

          {/* Mini stacked bar */}
          <div className="dash-stacked-wrap">
            <p className="dash-stacked-label">Total breakdown</p>
            <div className="dash-stacked-bar">
              {total > 0 && <>
                <div style={{ width: `${(done/total)*100}%`, background: 'var(--c-done)' }} title={`Done: ${done}`}></div>
                <div style={{ width: `${(inProg/total)*100}%`, background: 'var(--c-prog)' }} title={`In Progress: ${inProg}`}></div>
                <div style={{ width: `${(todo/total)*100}%`, background: 'var(--c-todo)' }} title={`To Do: ${todo}`}></div>
              </>}
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="dash-card dash-team-card">
          <h3 className="dash-card-title">👥 Team Workload</h3>
          {data?.perUser?.length === 0 ? (
            <div className="dash-empty">
              <span>🙈</span>
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <div className="dash-team-list">
              {data?.perUser?.sort((a, b) => b.count - a.count).map((u, i) => {
                const maxCount = Math.max(...data.perUser.map(x => x.count));
                const pct = Math.round((u.count / maxCount) * 100);
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
                return (
                  <div key={i} className="dash-team-item">
                    <div className="dash-team-avatar" style={{ background: colors[i % colors.length] }}>
                      {initials}
                    </div>
                    <div className="dash-team-info">
                      <div className="dash-team-name">{u.name}</div>
                      <div className="dash-team-bar-wrap">
                        <div className="dash-team-bar" style={{ width: `${pct}%`, background: colors[i % colors.length] }}></div>
                      </div>
                    </div>
                    <div className="dash-team-count">{u.count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="dash-card dash-overdue-card">
          <h3 className="dash-card-title">
            ⚠️ Overdue Tasks
            {data?.overdueCount > 0 && (
              <span className="dash-overdue-badge">{data.overdueCount}</span>
            )}
          </h3>
          {data?.overdueTasks?.length === 0 ? (
            <div className="dash-empty">
              <span>🎉</span>
              <p>All caught up! No overdue tasks.</p>
            </div>
          ) : (
            <div className="dash-overdue-list">
              {data?.overdueTasks?.map((t, i) => {
                const daysLate = Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                return (
                  <div key={t._id} className="dash-overdue-item" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="dash-overdue-left">
                      <div className="dash-overdue-indicator"></div>
                      <div>
                        <div className="dash-overdue-title">{t.title}</div>
                        <div className="dash-overdue-meta">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="dash-overdue-days">
                      {daysLate}d late
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="dash-card dash-members-card">
          <h3 className="dash-card-title">👤 Team Members</h3>
          <div className="dash-members-list">
            {project?.members?.map((m, i) => {
              const initials = m.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
              return (
                <div key={m.user._id} className="dash-member-item">
                  <div className="dash-member-avatar" style={{ background: colors[i % colors.length] }}>
                    {initials}
                  </div>
                  <div className="dash-member-info">
                    <div className="dash-member-name">{m.user.name}</div>
                    <div className="dash-member-email">{m.user.email}</div>
                  </div>
                  <span className={`dash-role-badge ${m.role === 'Admin' ? 'dash-role-admin' : 'dash-role-member'}`}>
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dash-card dash-quick-card">
          <h3 className="dash-card-title">📈 Quick Stats</h3>
          <div className="dash-quick-grid">
            <div className="dash-quick-item">
              <div className="dash-quick-val">{project?.members?.length || 0}</div>
              <div className="dash-quick-label">Team Size</div>
            </div>
            <div className="dash-quick-item">
              <div className="dash-quick-val">{completion}%</div>
              <div className="dash-quick-label">Completion</div>
            </div>
            <div className="dash-quick-item">
              <div className="dash-quick-val">{total > 0 ? Math.round(done / total * 10) : 0}/10</div>
              <div className="dash-quick-label">Health Score</div>
            </div>
            <div className="dash-quick-item">
              <div className="dash-quick-val">{data?.perUser?.length || 0}</div>
              <div className="dash-quick-label">Active Users</div>
            </div>
          </div>

          <div className="dash-health-bar-wrap">
            <div className="dash-health-label">
              <span>Project Health</span>
              <span>{completion >= 70 ? '🟢 Good' : completion >= 40 ? '🟡 Fair' : '🔴 At Risk'}</span>
            </div>
            <div className="dash-health-track">
              <div className="dash-health-fill" style={{
                width: `${completion}%`,
                background: completion >= 70 ? '#10b981' : completion >= 40 ? '#f59e0b' : '#ef4444'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
