const { query } = require('../db');

// @desc    Create a new recurring task template
// @route   POST /api/recurring-tasks
// @access  Private (Project Manager, Admin)
const createRecurringTask = async (req, res) => {
  const {
    project_id, title, description, recurrence_pattern, start_date,
    end_date, due_time, default_assigned_to_user_id, default_priority
  } = req.body;
  const { organization_id, id: created_by_user_id } = req.user;

  if (!title || !recurrence_pattern || !start_date) {
    return res.status(400).json({ message: 'Title, recurrence pattern, and start date are required.' });
  }

  try {
    // Optional: Validate project_id and default_assigned_to_user_id belong to the same organization
    if (project_id) {
      const projectCheck = await query('SELECT id FROM projects WHERE id = $1 AND organization_id = $2', [project_id, organization_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Project not found or does not belong to your organization.' });
      }
    }
    if (default_assigned_to_user_id) {
      const userCheck = await query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [default_assigned_to_user_id, organization_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Default assigned user not found or does not belong to your organization.' });
      }
    }

    const result = await query(
      `INSERT INTO recurring_tasks (organization_id, created_by_user_id, project_id, title, description,
                                  recurrence_pattern, start_date, end_date, due_time,
                                  default_assigned_to_user_id, default_priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, description, recurrence_pattern, start_date, end_date, created_at, updated_at`,
      [organization_id, created_by_user_id, project_id, title, description,
        recurrence_pattern, start_date, end_date, due_time,
        default_assigned_to_user_id, default_priority || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating recurring task:', error);
    res.status(500).json({ message: 'Server error while creating recurring task.' });
  }
};

// @desc    Get all recurring tasks for an organization
// @route   GET /api/recurring-tasks
// @access  Private (All authenticated users)
const getRecurringTasks = async (req, res) => {
  const { organization_id } = req.user;
  const { project_id, search } = req.query;

  let filterQuery = 'WHERE rt.organization_id = $1';
  const queryParams = [organization_id];
  let paramIndex = 2;

  if (project_id) {
    filterQuery += ` AND rt.project_id = $${paramIndex++}`;
    queryParams.push(project_id);
  }
  if (search) {
    filterQuery += ` AND (rt.title ILIKE $${paramIndex} OR rt.description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
  }

  try {
    const result = await query(
      `SELECT
        rt.id, rt.project_id, rt.title, rt.description, rt.recurrence_pattern, rt.start_date, rt.end_date,
        rt.due_time, rt.default_assigned_to_user_id, rt.default_priority, rt.created_at, rt.updated_at,
        p.name AS project_name,
        assigned_user.first_name AS default_assigned_user_first_name,
        assigned_user.last_name AS default_assigned_user_last_name
       FROM recurring_tasks rt
       LEFT JOIN projects p ON rt.project_id = p.id
       LEFT JOIN users assigned_user ON rt.default_assigned_to_user_id = assigned_user.id
       ${filterQuery} ORDER BY rt.created_at DESC`,
      queryParams
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    res.status(500).json({ message: 'Server error while fetching recurring tasks.' });
  }
};

// @desc    Get a single recurring task by ID
// @route   GET /api/recurring-tasks/:id
// @access  Private (All authenticated users)
const getRecurringTaskById = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `SELECT
        rt.id, rt.project_id, rt.title, rt.description, rt.recurrence_pattern, rt.start_date, rt.end_date,
        rt.due_time, rt.default_assigned_to_user_id, rt.default_priority, rt.created_by_user_id, rt.created_at, rt.updated_at,
        p.name AS project_name,
        assigned_user.first_name AS default_assigned_user_first_name,
        assigned_user.last_name AS default_assigned_user_last_name,
        created_user.first_name AS created_user_first_name,
        created_user.last_name AS created_user_last_name
       FROM recurring_tasks rt
       LEFT JOIN projects p ON rt.project_id = p.id
       LEFT JOIN users assigned_user ON rt.default_assigned_to_user_id = assigned_user.id
       LEFT JOIN users created_user ON rt.created_by_user_id = created_user.id
       WHERE rt.id = $1 AND rt.organization_id = $2`,
      [id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring task not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching recurring task by ID:', error);
    res.status(500).json({ message: 'Server error while fetching recurring task.' });
  }
};

// @desc    Update a recurring task
// @route   PUT /api/recurring-tasks/:id
// @access  Private (Project Manager, Admin)
const updateRecurringTask = async (req, res) => {
  const { id } = req.params;
  const {
    project_id, title, description, recurrence_pattern, start_date,
    end_date, due_time, default_assigned_to_user_id, default_priority
  } = req.body;
  const { organization_id } = req.user;

  try {
    // Optional: Validate project_id and default_assigned_to_user_id belong to the same organization
    if (project_id) {
      const projectCheck = await query('SELECT id FROM projects WHERE id = $1 AND organization_id = $2', [project_id, organization_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Project not found or does not belong to your organization.' });
      }
    }
    if (default_assigned_to_user_id) {
      const userCheck = await query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [default_assigned_to_user_id, organization_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Default assigned user not found or does not belong to your organization.' });
      }
    }

    const result = await query(
      `UPDATE recurring_tasks
       SET project_id = COALESCE($1, project_id),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           recurrence_pattern = COALESCE($4, recurrence_pattern),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date),
           due_time = COALESCE($7, due_time),
           default_assigned_to_user_id = COALESCE($8, default_assigned_to_user_id),
           default_priority = COALESCE($9, default_priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND organization_id = $11
       RETURNING id, title, description, recurrence_pattern, start_date, end_date, created_at, updated_at`,
      [project_id, title, description, recurrence_pattern, start_date,
        end_date, due_time, default_assigned_to_user_id, default_priority, id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring task not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating recurring task:', error);
    res.status(500).json({ message: 'Server error while updating recurring task.' });
  }
};

// @desc    Delete a recurring task
// @route   DELETE /api/recurring-tasks/:id
// @access  Private (Project Manager, Admin)
const deleteRecurringTask = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `DELETE FROM recurring_tasks WHERE id = $1 AND organization_id = $2 RETURNING id`,
      [id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring task not found or you do not have access.' });
    }
    res.status(200).json({ message: 'Recurring task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting recurring task:', error);
    res.status(500).json({ message: 'Server error while deleting recurring task.' });
  }
};

module.exports = {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTaskById,
  updateRecurringTask,
  deleteRecurringTask,
};
