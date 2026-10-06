import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Plus,
  Users,
  UserPlus,
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

const ProjectBoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filterMember, setFilterMember] = useState('ALL');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Add Member form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState('');

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get('/auth/users')
      ]);

      if (projRes.data.success) setProject(projRes.data.project);
      if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
      if (usersRes.data.success) setAllUsers(usersRes.data.users);
    } catch (err) {
      console.error('Failed to load project board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      setTaskSubmitting(true);
      const res = await api.post('/tasks', {
        projectId: id,
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignee || null,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || null
      });

      if (res.data.success) {
        setTasks([res.data.task, ...tasks]);
        setTaskTitle('');
        setTaskDesc('');
        setTaskAssignee('');
        setTaskStatus('Todo');
        setTaskPriority('Medium');
        setTaskDueDate('');
        setIsTaskModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchProjectAndTasks(); // rollback on failure
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');

    try {
      setMemberSubmitting(true);
      const payload = selectedUserId ? { userId: selectedUserId } : { email: memberEmail };
      const res = await api.post(`/projects/${id}/members`, payload);

      if (res.data.success) {
        setProject(res.data.project);
        setIsMemberModalOpen(false);
        setSelectedUserId('');
        setMemberEmail('');
      }
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Error adding member');
    } finally {
      setMemberSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Kanban Board..." />;
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Project not found</h3>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  // Filter tasks if member selected
  const visibleTasks = tasks.filter((t) => {
    if (filterMember === 'ALL') return true;
    if (filterMember === 'UNASSIGNED') return !t.assignedTo;
    return t.assignedTo?._id === filterMember;
  });

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/projects"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Back to all projects"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {project.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.15rem' }}>
              {project.description || 'No project description provided'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Members Bar & Filter */}
      <div
        className="card"
        style={{
          padding: '0.9rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
            TEAM MEMBERS ({project.members?.length || 0}):
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {project.members?.map((m) => (
              <span
                key={m._id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}
                />
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Filter by Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Filter Assignee:</span>
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {project.members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board">
        {COLUMNS.map((column) => {
          const columnTasks = visibleTasks.filter((t) => t.status === column);

          return (
            <div key={column} className="kanban-column">
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor:
                        column === 'Todo'
                          ? '#38bdf8'
                          : column === 'In Progress'
                          ? '#f59e0b'
                          : '#10b981'
                    }}
                  />
                  <span>{column}</span>
                  <span className="kanban-count-pill">{columnTasks.length}</span>
                </div>

                <button
                  onClick={() => {
                    setTaskStatus(column);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.45rem', borderRadius: '4px' }}
                  title={`Add task in ${column}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="kanban-cards-wrapper">
                {columnTasks.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1rem',
                      color: 'var(--text-subtle)',
                      fontSize: '0.85rem',
                      border: '1px dashed var(--border-card)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    No tasks in {column}
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task._id}
                      className="task-card"
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <PriorityBadge priority={task.priority} />
                        {task.dueDate && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>

                      <h4 className="task-card-title">{task.title}</h4>

                      {task.description && (
                        <p className="task-card-desc">{task.description}</p>
                      )}

                      <div className="task-card-footer">
                        <span style={{ color: task.assignedTo ? 'var(--text-main)' : 'var(--text-subtle)' }}>
                          👤 {task.assignedTo?.name || 'Unassigned'}
                        </span>

                        {/* Quick Status Shift buttons */}
                        <div
                          style={{ display: 'flex', gap: '0.3rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {column !== 'Todo' && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  task._id,
                                  column === 'Done' ? 'In Progress' : 'Todo'
                                )
                              }
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 5px' }}
                              title="Move Left"
                            >
                              <ChevronLeft size={13} />
                            </button>
                          )}
                          {column !== 'Done' && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  task._id,
                                  column === 'Todo' ? 'In Progress' : 'Done'
                                )
                              }
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 5px' }}
                              title="Move Right"
                            >
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Implement user authentication"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Details or acceptance criteria..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={taskSubmitting}
            >
              {taskSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Add Project Member"
      >
        <form onSubmit={handleAddMember}>
          {memberError && (
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
              {memberError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Registered User</label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setMemberEmail('');
              }}
            >
              <option value="">-- Choose User --</option>
              {allUsers
                .filter((u) => !project.members?.some((m) => m._id === u._id))
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
            — OR enter email address —
          </div>

          <div className="form-group">
            <label className="form-label">Member Email</label>
            <input
              type="email"
              placeholder="colleague@codealpha.com"
              value={memberEmail}
              onChange={(e) => {
                setMemberEmail(e.target.value);
                setSelectedUserId('');
              }}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsMemberModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={memberSubmitting || (!selectedUserId && !memberEmail)}
            >
              {memberSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectBoardPage;
