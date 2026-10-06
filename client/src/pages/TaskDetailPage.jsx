import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Trash2,
  Save,
  MessageSquare,
  Send,
  AlertCircle,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const [taskRes, commentRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/comments/task/${id}`)
      ]);

      if (taskRes.data.success) {
        const t = taskRes.data.task;
        setTask(t);
        setTitle(t.title);
        setDescription(t.description || '');
        setStatus(t.status);
        setPriority(t.priority || 'Medium');
        setAssignedTo(t.assignedTo?._id || '');
        setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');

        // Fetch project members for assignment dropdown
        if (t.projectId?._id) {
          const projRes = await api.get(`/projects/${t.projectId._id}`);
          if (projRes.data.success) {
            setProjectMembers(projRes.data.project.members || []);
          }
        }
      }

      if (commentRes.data.success) {
        setComments(commentRes.data.comments);
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/tasks/${id}`, {
        title,
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null
      });

      if (res.data.success) {
        setTask(res.data.task);
        setFeedbackMsg('Task updated successfully!');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.delete(`/tasks/${id}`);
      if (res.data.success) {
        if (task?.projectId?._id) {
          navigate(`/projects/${task.projectId._id}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentSubmitting(true);
      const res = await api.post('/comments', {
        taskId: id,
        message: newComment
      });

      if (res.data.success) {
        setComments([...comments, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (!task) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Task not found</h3>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => {
              if (task.projectId?._id) navigate(`/projects/${task.projectId._id}`);
              else navigate(-1);
            }}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Project</span>
          </button>

          <span style={{ color: 'var(--text-subtle)' }}>•</span>

          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Project:{' '}
            <strong style={{ color: '#fff' }}>{task.projectId?.title || 'Workspace'}</strong>
          </span>
        </div>

        <button onClick={handleDeleteTask} className="btn btn-danger btn-sm">
          <Trash2 size={15} />
          <span>Delete Task</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.9rem'
          }}
        >
          {feedbackMsg}
        </div>
      )}

      {/* Main Task Form Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSaveTask}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ fontSize: '1.15rem', fontWeight: 600 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add detailed task notes..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
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
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-card)'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Created by: <strong>{task.createdBy?.name || 'User'}</strong> on{' '}
              {new Date(task.createdAt).toLocaleDateString()}
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-card)',
            paddingBottom: '0.85rem'
          }}
        >
          <MessageSquare size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comment input box */}
        <form onSubmit={handleAddComment} style={{ marginBottom: '1.75rem' }}>
          <div className="form-group">
            <textarea
              rows={3}
              placeholder="Leave a comment or update for the team..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={commentSubmitting || !newComment.trim()}
            >
              <Send size={15} />
              <span>{commentSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comments timeline */}
        <div className="comments-timeline">
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1rem' }}>
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-bubble">
                <div className="comment-bubble-header">
                  <span className="comment-author">
                    {comment.userId?.name || 'Anonymous Member'}
                  </span>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {comment.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
