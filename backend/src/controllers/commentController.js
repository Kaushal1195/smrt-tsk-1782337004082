const { query } = require('../db');

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private (All authenticated users)
const createComment = async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const { organization_id, id: user_id } = req.user;

  if (!content) {
    return res.status(400).json({ message: 'Comment content cannot be empty.' });
  }

  try {
    // Verify task exists and belongs to the user's organization
    const taskCheck = await query('SELECT id FROM tasks WHERE id = $1 AND organization_id = $2', [taskId, organization_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or does not belong to your organization.' });
    }

    const result = await query(
      `INSERT INTO comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, content, created_at, updated_at`,
      [taskId, user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error while creating comment.' });
  }
};

// @desc    Get all comments for a specific task
// @route   GET /api/tasks/:taskId/comments
// @access  Private (All authenticated users)
const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;
  const { organization_id, id: current_user_id, role } = req.user;

  try {
    // Verify task exists and belongs to the user's organization (and user has access)
    let taskCheckQuery = 'SELECT id FROM tasks WHERE id = $1 AND organization_id = $2';
    const taskCheckParams = [taskId, organization_id];

    if (role === 'individual_contributor') {
      taskCheckQuery += ` AND (assigned_to_user_id = $3 OR created_by_user_id = $3)`;
      taskCheckParams.push(current_user_id);
    }

    const taskCheck = await query(taskCheckQuery, taskCheckParams);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have access.' });
    }

    const result = await query(
      `SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, c.updated_at,
              u.first_name, u.last_name, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments.' });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Comment author, Project Manager, Admin)
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const { organization_id, id: current_user_id, role } = req.user;

  if (!content) {
    return res.status(400).json({ message: 'Comment content cannot be empty.' });
  }

  try {
    // Check if comment exists and belongs to the organization
    const commentCheck = await query(
      `SELECT c.user_id, t.organization_id
       FROM comments c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (commentCheck.rows.length === 0 || commentCheck.rows[0].organization_id !== organization_id) {
      return res.status(404).json({ message: 'Comment not found or does not belong to your organization.' });
    }

    // Only the author, PM, or Admin can update
    if (commentCheck.rows[0].user_id !== current_user_id && !['admin', 'project_manager'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own comments or have higher privileges.' });
    }

    const result = await query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, task_id, user_id, content, created_at, updated_at`,
      [content, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error while updating comment.' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author, Project Manager, Admin)
const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { organization_id, id: current_user_id, role } = req.user;

  try {
    // Check if comment exists and belongs to the organization
    const commentCheck = await query(
      `SELECT c.user_id, t.organization_id
       FROM comments c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (commentCheck.rows.length === 0 || commentCheck.rows[0].organization_id !== organization_id) {
      return res.status(404).json({ message: 'Comment not found or does not belong to your organization.' });
    }

    // Only the author, PM, or Admin can delete
    if (commentCheck.rows[0].user_id !== current_user_id && !['admin', 'project_manager'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments or have higher privileges.' });
    }

    const result = await query(
      `DELETE FROM comments WHERE id = $1 RETURNING id`,
      [id]
    );

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error while deleting comment.' });
  }
};

module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
};
