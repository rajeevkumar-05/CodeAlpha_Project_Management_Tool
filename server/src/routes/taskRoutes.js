const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardSummary
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes are protected
router.use(protect);

router.get('/dashboard/summary', getDashboardSummary);

router.route('/')
  .post(createTask);

router.get('/project/:projectId', getTasksByProject);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
