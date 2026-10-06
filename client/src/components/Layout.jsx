import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Modal from './Modal';
import api from '../services/api';

const Layout = () => {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/projects', {
        title: projectTitle,
        description: projectDesc
      });
      if (res.data.success) {
        setProjectTitle('');
        setProjectDesc('');
        setIsCreateProjectOpen(false);
        // Dispatch custom event to notify current page if it listens for project updates
        window.dispatchEvent(new CustomEvent('project-created', { detail: res.data.project }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <Navbar onOpenCreateProject={() => setIsCreateProjectOpen(true)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Create Project Modal */}
      <Modal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          {error && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem'
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              placeholder="e.g. Website Redesign 2026"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              placeholder="Brief overview of project goals..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateProjectOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Layout;
