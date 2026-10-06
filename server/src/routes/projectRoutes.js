const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// All project routes are protected
router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);

module.exports = router;
