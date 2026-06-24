const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all comment routes
router.use(protect);

// Routes for comments related to a specific task
router.route('/tasks/:taskId/comments')
  .post(createComment)
  .get(getCommentsByTask);

// Routes for individual comments
router.route('/:id')
  .put(updateComment)
  .delete(deleteComment);

module.exports = router;
