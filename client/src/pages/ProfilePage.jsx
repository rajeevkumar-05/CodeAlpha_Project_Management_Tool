import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  ListTodo,
  Clock,
  LogOut,
  FolderKanban,
  ArrowUpRight
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks/dashboard/summary');
        if (res.data.success) {
          // Filter tasks assigned to current user
          const myTasks = (res.data.summary.recentTasks || []).filter(
            (t) => t.assignedTo?._id === user?.id
          );
          setAssignedTasks(myTasks);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
          User Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your account credentials and personal task queue
        </p>
      </div>

      {/* User Info Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #151d2a 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            className="avatar"
            style={{ width: '64px', height: '64px', fontSize: '1.4rem' }}
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
              {user?.name}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                marginTop: '0.25rem'
              }}
            >
              <Mail size={15} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Assigned Tasks Card */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-card)',
            paddingBottom: '0.85rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Tasks Assigned To Me
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Direct accountability items
            </p>
          </div>

          <Link to="/projects" className="btn btn-primary btn-sm">
            <FolderKanban size={15} />
            <span>Go to Boards</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching your tasks..." />
        ) : assignedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <ListTodo size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              No tasks currently assigned to you
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
              When a team member or project manager assigns a task to your email, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignedTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#fff' }}>
                      {task.title}
                    </h4>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                    Project: {task.projectId?.title || 'Workspace'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={task.status} />
                  <ArrowUpRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
