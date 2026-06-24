const express = require('express');
const router = express.Router();
const {
  createTimeEntry,
  getTimeEntriesByTask,
  getTimeEntriesForCurrentUser,
  updateTimeEntry,
  deleteTimeEntry,
} = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

// Protect all time entry routes
router.use(protect);

router.route('/')
  .post(createTimeEntry); // All authenticated users can create time entries

router.get('/me', getTimeEntriesForCurrentUser); // Get time entries for the current user

router.route('/tasks/:taskId')
  .get(getTimeEntriesByTask); // Get time entries for a specific task

router.route('/:id')
  .put(updateTimeEntry) // Update a specific time entry
  .delete(deleteTimeEntry); // Delete a specific time entry

module.exports = router;
