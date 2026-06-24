const express = require('express');
const router = express.Router();
const {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTaskById,
  updateRecurringTask,
  deleteRecurringTask,
} = require('../controllers/recurringTaskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all recurring task routes
router.use(protect);

router.route('/')
  .post(authorizeRoles('admin', 'project_manager'), createRecurringTask)
  .get(getRecurringTasks); // All authenticated users can view recurring tasks

router.route('/:id')
  .get(getRecurringTaskById)
  .put(authorizeRoles('admin', 'project_manager'), updateRecurringTask)
  .delete(authorizeRoles('admin', 'project_manager'), deleteRecurringTask);

module.exports = router;
