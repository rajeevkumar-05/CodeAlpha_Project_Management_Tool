const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedTo, status, dueDate, priority } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId and task title'
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = await Task.create({
      projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task'
    });
  }
};

// @desc    Get all tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tasks'
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching task'
    });
  }
};

// @desc    Update a task (e.g. status, details, assignee)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, dueDate, priority } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task'
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete comments on this task
    await Comment.deleteMany({ taskId: task._id });

    // Delete task
    await Task.findByIdAndDelete(task._id);

    return res.status(200).json({
      success: true,
      message: 'Task and related comments deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting task'
    });
  }
};

// @desc    Get dashboard metrics & summary for current user
// @route   GET /api/tasks/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get projects user is part of
    const userProjects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }]
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    // Tasks across these projects
    const allTasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });

    const totalProjects = userProjects.length;
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter((t) => t.status === 'Todo').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const doneTasks = allTasks.filter((t) => t.status === 'Done').length;

    // Assigned directly to user
    const assignedToMe = allTasks.filter(
      (t) => t.assignedTo && t.assignedTo._id.toString() === userId.toString()
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        assignedToMeCount: assignedToMe.length,
        recentTasks: allTasks.slice(0, 6)
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating summary'
    });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardSummary
};
