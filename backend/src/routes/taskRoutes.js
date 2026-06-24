const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all task routes
router.use(protect);

router.route('/')
  .post(createTask) // All authenticated users can create tasks
  .get(getTasks); // All authenticated users can view tasks (with internal filtering)

router.route('/:id')
  .get(getTaskById) // All authenticated users can view tasks (with internal filtering)
  .put(updateTask) // All authenticated users can update tasks (with internal restrictions)
  .delete(authorizeRoles('admin', 'project_manager'), deleteTask); // Only PM/Admin can delete tasks

module.exports = router;
