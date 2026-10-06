const Comment = require('../models/Comment');
const Task = require('../models/Task');

// @desc    Add a comment to a task
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (!taskId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide taskId and message'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = await Comment.create({
      taskId,
      userId: req.user._id,
      message
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'userId',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment'
    });
  }
};

// @desc    Get all comments for a specific task
// @route   GET /api/comments/task/:taskId
// @access  Private
const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comments = await Comment.find({ taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching comments'
    });
  }
};

module.exports = {
  addComment,
  getCommentsByTask
};
