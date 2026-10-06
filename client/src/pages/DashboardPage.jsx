import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Users
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, projRes] = await Promise.all([
        api.get('/tasks/dashboard/summary'),
        api.get('/projects')
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.summary);
      }
      if (projRes.data.success) {
        setProjects(projRes.data.projects);
      }
    } catch (err) {
      console.error('Error fetching dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to custom event if project created globally
    const handleProjectCreated = () => fetchDashboardData();
    window.addEventListener('project-created', handleProjectCreated);
    return () => window.removeEventListener('project-created', handleProjectCreated);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const totalTasks = summary?.totalTasks || 0;
  const doneTasks = summary?.doneTasks || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.82rem',
              color: '#818cf8',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Project Management Dashboard
          </span>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>
            Hello, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Here is what's happening across your projects and tasks today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/projects" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Go to Projects</span>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
          >
            <FolderKanban size={26} />
          </div>
          <div>
            <div className="stat-val">{summary?.totalProjects || 0}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
          >
            <ListTodo size={26} />
          </div>
          <div>
            <div className="stat-val">{summary?.todoTasks || 0}</div>
            <div className="stat-label">Tasks Todo</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-val">{summary?.inProgressTasks || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
          >
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-val">{summary?.doneTasks || 0}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>
      </div>

      {/* Progress Metric Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Overall Team Velocity</h3>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8' }}>
            {completionPercentage}% Complete
          </span>
        </div>
        <div
          style={{
            height: '10px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border-card)'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPercentage}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          {doneTasks} of {totalTasks} total tasks resolved. Assigned directly to you:{' '}
          <strong style={{ color: '#fff' }}>{summary?.assignedToMeCount || 0}</strong>
        </p>
      </div>

      {/* Two Columns: Recent Projects & Recent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* Recent Projects */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>My Projects</h3>
            <Link
              to="/projects"
              style={{
                color: '#818cf8',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View All <ArrowUpRight size={16} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <FolderKanban size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.92rem' }}>No projects found yet.</p>
              <Link
                to="/projects"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem' }}
              >
                Create First Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover-border-highlight"
                >
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#fff' }}>
                      {project.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem',
                        maxWidth: '260px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {project.description || 'No description provided'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-subtle)'
                      }}
                    >
                      <Users size={14} />
                      <span>{project.members?.length || 1}</span>
                    </div>
                    <span
                      style={{
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8'
                      }}
                    >
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Tasks</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
              Latest updates
            </span>
          </div>

          {(!summary?.recentTasks || summary.recentTasks.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <ListTodo size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.92rem' }}>No tasks created yet.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                Open a project board to add your first task.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary.recentTasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4
                        style={{
                          fontSize: '0.94rem',
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                      {task.projectId?.title || 'Project'} • Assigned:{' '}
                      <span style={{ color: '#cbd5e1' }}>
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </p>
                  </div>

                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
