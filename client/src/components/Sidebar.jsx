import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  CheckCircle2,
  Layers
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Layers size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="sidebar-logo-text">CodeAlpha</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.05em' }}>
            PROJECT HUB
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FolderKanban size={19} />
          <span>All Projects</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <User size={19} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, marginBottom: '0.2rem' }}>
            <CheckCircle2 size={16} /> MERN Stack
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
            CodeAlpha Internship Project
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
