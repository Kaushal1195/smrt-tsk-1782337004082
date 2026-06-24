const express = require('express');
const router = express.Router();
const {
  createTaskDependency,
  getTaskDependencies,
  deleteTaskDependency,
} = require('../controllers/taskDependencyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all task dependency routes
router.use(protect);

router.route('/')
  .post(authorizeRoles('admin', 'project_manager'), createTaskDependency);

router.route('/tasks/:taskId')
  .get(getTaskDependencies); // All authenticated users can view dependencies for tasks they have access to

router.route('/:id')
  .delete(authorizeRoles('admin', 'project_manager'), deleteTaskDependency);

module.exports = router;
