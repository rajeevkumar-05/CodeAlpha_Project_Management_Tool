const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project title'
      });
    }

    // Ensure creator is in the members list
    const initialMembers = Array.isArray(members) ? [...members] : [];
    if (!initialMembers.some((m) => m.toString() === req.user._id.toString())) {
      initialMembers.push(req.user._id);
    }

    const project = await Project.create({
      title,
      description: description || '',
      members: initialMembers,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project'
    });
  }
};

// @desc    Get all projects for current user (created or member of)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching projects'
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is creator or member
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this project'
      });
    }

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching project'
    });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only project creator or members can update
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project'
    });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only creator can delete project
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can delete this project'
      });
    }

    // Find all tasks associated with this project
    const tasks = await Task.find({ projectId: project._id });
    const taskIds = tasks.map((t) => t._id);

    // Remove comments for all those tasks
    await Comment.deleteMany({ taskId: { $in: taskIds } });

    // Remove tasks
    await Task.deleteMany({ projectId: project._id });

    // Remove project
    await Project.findByIdAndDelete(project._id);

    return res.status(200).json({
      success: true,
      message: 'Project and all related tasks/comments deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting project'
    });
  }
};

// @desc    Add member to a project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email, userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let memberUser;
    if (userId) {
      memberUser = await User.findById(userId);
    } else if (email) {
      memberUser = await User.findOne({ email: email.toLowerCase() });
    }

    if (!memberUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found to add as member'
      });
    }

    const alreadyMember = project.members.some(
      (m) => m.toString() === memberUser._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    project.members.push(memberUser._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding member'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember
};
