import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      setError('');
      const res = await api.post('/projects', { title, description });
      if (res.data.success) {
        setTitle('');
        setDescription('');
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;

    try {
      const res = await api.delete(`/projects/${projectId}`);
      if (res.data.success) {
        setProjects(projects.filter((p) => p._id !== projectId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Projects
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage and track all collaborative projects
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Create Project</span>
        </button>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '1.75rem', position: 'relative', maxWidth: '420px' }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)'
          }}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching projects..." />
      ) : filteredProjects.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            color: 'var(--text-muted)'
          }}
        >
          <FolderKanban size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
            {searchTerm ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
            {searchTerm
              ? 'Try modifying your search keywords.'
              : 'Create your first project to start organizing tasks with Kanban boards and team members.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredProjects.map((proj) => {
            const isCreator = proj.createdBy?._id === user?.id || proj.createdBy === user?.id;
            const dateStr = new Date(proj.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <Link
                key={proj._id}
                to={`/projects/${proj._id}`}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  textDecoration: 'none'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '0.6rem'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#fff',
                        lineHeight: 1.3
                      }}
                    >
                      {proj.title}
                    </h3>
                    {isCreator && (
                      <button
                        onClick={(e) => handleDelete(e, proj._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem', flexShrink: 0 }}
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} />
                    <span>
                      {proj.members?.length || 1} {proj.members?.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate}>
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
              placeholder="e.g. Mobile App Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              placeholder="What are the goals, deadlines, and deliverables?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
