import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, CheckSquare, PlusCircle } from 'lucide-react';

const Navbar = ({ onOpenCreateProject }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <header className="navbar">
      <div className="navbar-left">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
          CodeAlpha Workspaces
        </span>
      </div>

      <div className="navbar-right">
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            <span>New Project</span>
          </button>
        )}

        <Link to="/profile" className="user-profile-badge" title="View Profile">
          <div className="avatar">{getInitials(user?.name)}</div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.name}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Sign Out"
          style={{ padding: '0.45rem 0.6rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
