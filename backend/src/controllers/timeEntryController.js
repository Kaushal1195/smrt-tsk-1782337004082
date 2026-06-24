const { query } = require('../db');

// @desc    Create a new time entry for a task
// @route   POST /api/time-entries
// @access  Private (All authenticated users)
const createTimeEntry = async (req, res) => {
  const { task_id, start_time, end_time, duration_minutes, description } = req.body;
  const { organization_id, id: user_id } = req.user;

  if (!task_id || !start_time) {
    return res.status(400).json({ message: 'Task ID and start time are required.' });
  }

  try {
    // Verify task exists and belongs to the user's organization
    const taskCheck = await query('SELECT id FROM tasks WHERE id = $1 AND organization_id = $2', [task_id, organization_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or does not belong to your organization.' });
    }

    // Calculate duration if end_time is provided and duration_minutes is not
    let finalDuration = duration_minutes;
    if (start_time && end_time && !duration_minutes) {
      const start = new Date(start_time);
      const end = new Date(end_time);
      if (end < start) {
        return res.status(400).json({ message: 'End time cannot be before start time.' });
      }
      finalDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
    }

    const result = await query(
      `INSERT INTO time_entries (task_id, user_id, start_time, end_time, duration_minutes, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, task_id, user_id, start_time, end_time, duration_minutes, description, created_at, updated_at`,
      [task_id, user_id, start_time, end_time, finalDuration, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ message: 'Server error while creating time entry.' });
  }
};

// @desc    Get time entries for a specific task
// @route   GET /api/tasks/:taskId/time-entries
// @access  Private (All authenticated users)
const getTimeEntriesByTask = async (req, res) => {
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
      `SELECT te.id, te.task_id, te.user_id, te.start_time, te.end_time, te.duration_minutes, te.description, te.created_at, te.updated_at,
              u.first_name, u.last_name
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE te.task_id = $1
       ORDER BY te.start_time DESC`,
      [taskId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries by task:', error);
    res.status(500).json({ message: 'Server error while fetching time entries.' });
  }
};

// @desc    Get time entries for the current user
// @route   GET /api/time-entries/me
// @access  Private (All authenticated users)
const getTimeEntriesForCurrentUser = async (req, res) => {
  const { id: user_id } = req.user;

  try {
    const result = await query(
      `SELECT te.id, te.task_id, te.user_id, te.start_time, te.end_time, te.duration_minutes, te.description, te.created_at, te.updated_at,
              t.title AS task_title, p.name AS project_name
       FROM time_entries te
       JOIN tasks t ON te.task_id = t.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE te.user_id = $1
       ORDER BY te.start_time DESC`,
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries for current user:', error);
    res.status(500).json({ message: 'Server error while fetching time entries.' });
  }
};


// @desc    Update a time entry
// @route   PUT /api/time-entries/:id
// @access  Private (Time entry author, Project Manager, Admin)
const updateTimeEntry = async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, duration_minutes, description } = req.body;
  const { organization_id, id: current_user_id, role } = req.user;

  try {
    // Check if time entry exists and belongs to the organization
    const timeEntryCheck = await query(
      `SELECT te.user_id, t.organization_id
       FROM time_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.id = $1`,
      [id]
    );

    if (timeEntryCheck.rows.length === 0 || timeEntryCheck.rows[0].organization_id !== organization_id) {
      return res.status(404).json({ message: 'Time entry not found or does not belong to your organization.' });
    }

    // Only the author, PM, or Admin can update
    if (timeEntryCheck.rows[0].user_id !== current_user_id && !['admin', 'project_manager'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own time entries or have higher privileges.' });
    }

    // Recalculate duration if end_time is provided
    let finalDuration = duration_minutes;
    if (start_time && end_time && !duration_minutes) {
      const start = new Date(start_time);
      const end = new Date(end_time);
      if (end < start) {
        return res.status(400).json({ message: 'End time cannot be before start time.' });
      }
      finalDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
    } else if (end_time === null) { // If end_time is explicitly set to null, duration should also be null
        finalDuration = null;
    }


    const result = await query(
      `UPDATE time_entries
       SET start_time = COALESCE($1, start_time),
           end_time = $2, -- Allow setting to NULL
           duration_minutes = $3, -- Allow setting to NULL
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, task_id, user_id, start_time, end_time, duration_minutes, description, created_at, updated_at`,
      [start_time, end_time, finalDuration, description, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ message: 'Server error while updating time entry.' });
  }
};

// @desc    Delete a time entry
// @route   DELETE /api/time-entries/:id
// @access  Private (Time entry author, Project Manager, Admin)
const deleteTimeEntry = async (req, res) => {
  const { id } = req.params;
  const { organization_id, id: current_user_id, role } = req.user;

  try {
    // Check if time entry exists and belongs to the organization
    const timeEntryCheck = await query(
      `SELECT te.user_id, t.organization_id
       FROM time_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.id = $1`,
      [id]
    );

    if (timeEntryCheck.rows.length === 0 || timeEntryCheck.rows[0].organization_id !== organization_id) {
      return res.status(404).json({ message: 'Time entry not found or does not belong to your organization.' });
    }

    // Only the author, PM, or Admin can delete
    if (timeEntryCheck.rows[0].user_id !== current_user_id && !['admin', 'project_manager'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own time entries or have higher privileges.' });
    }

    const result = await query(
      `DELETE FROM time_entries WHERE id = $1 RETURNING id`,
      [id]
    );

    res.status(200).json({ message: 'Time entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ message: 'Server error while deleting time entry.' });
  }
};

module.exports = {
  createTimeEntry,
  getTimeEntriesByTask,
  getTimeEntriesForCurrentUser,
  updateTimeEntry,
  deleteTimeEntry,
};
