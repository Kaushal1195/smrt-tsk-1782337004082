const { query } = require('../db');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (All authenticated users)
const createTask = async (req, res) => {
  const {
    project_id, parent_task_id, recurring_task_id, title, description,
    status, priority, start_date, due_date, estimated_effort_hours, assigned_to_user_id
  } = req.body;
  const { organization_id, id: created_by_user_id } = req.user;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  try {
    // Optional: Validate project_id and assigned_to_user_id belong to the same organization
    if (project_id) {
      const projectCheck = await query('SELECT id FROM projects WHERE id = $1 AND organization_id = $2', [project_id, organization_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Project not found or does not belong to your organization.' });
      }
    }
    if (assigned_to_user_id) {
      const userCheck = await query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [assigned_to_user_id, organization_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Assigned user not found or does not belong to your organization.' });
      }
    }

    const result = await query(
      `INSERT INTO tasks (organization_id, project_id, parent_task_id, recurring_task_id, title, description,
                          status, priority, start_date, due_date, estimated_effort_hours, assigned_to_user_id, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, title, description, status, priority, due_date, assigned_to_user_id, created_at, updated_at`,
      [organization_id, project_id, parent_task_id, recurring_task_id, title, description,
        status || 'open', priority || 'medium', start_date, due_date, estimated_effort_hours, assigned_to_user_id, created_by_user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task.' });
  }
};

// @desc    Get all tasks for an organization, with filters
// @route   GET /api/tasks
// @access  Private (All authenticated users)
const getTasks = async (req, res) => {
  const { organization_id, id: current_user_id, role } = req.user;
  const { project_id, assigned_to_user_id, status, priority, due_date_before, due_date_after, search, include_subtasks } = req.query;

  let filterQuery = 'WHERE t.organization_id = $1';
  const queryParams = [organization_id];
  let paramIndex = 2;

  // If not admin or project manager, restrict to tasks assigned to the user
  if (role === 'individual_contributor') {
    filterQuery += ` AND (t.assigned_to_user_id = $${paramIndex++} OR t.created_by_user_id = $${paramIndex++})`;
    queryParams.push(current_user_id, current_user_id);
  }

  if (project_id) {
    filterQuery += ` AND t.project_id = $${paramIndex++}`;
    queryParams.push(project_id);
  }
  if (assigned_to_user_id) {
    filterQuery += ` AND t.assigned_to_user_id = $${paramIndex++}`;
    queryParams.push(assigned_to_user_id);
  }
  if (status) {
    filterQuery += ` AND t.status = $${paramIndex++}`;
    queryParams.push(status);
  }
  if (priority) {
    filterQuery += ` AND t.priority = $${paramIndex++}`;
    queryParams.push(priority);
  }
  if (due_date_before) {
    filterQuery += ` AND t.due_date <= $${paramIndex++}`;
    queryParams.push(due_date_before);
  }
  if (due_date_after) {
    filterQuery += ` AND t.due_date >= $${paramIndex++}`;
    queryParams.push(due_date_after);
  }
  if (search) {
    filterQuery += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
  }
  if (include_subtasks !== 'true') {
    filterQuery += ` AND t.parent_task_id IS NULL`; // Only top-level tasks by default
  }

  try {
    const result = await query(
      `SELECT
        t.id, t.project_id, t.parent_task_id, t.recurring_task_id, t.title, t.description,
        t.status, t.priority, t.start_date, t.due_date, t.completed_at, t.estimated_effort_hours,
        t.assigned_to_user_id, t.created_by_user_id, t.created_at, t.updated_at,
        p.name AS project_name,
        assigned_user.first_name AS assigned_user_first_name,
        assigned_user.last_name AS assigned_user_last_name,
        created_user.first_name AS created_user_first_name,
        created_user.last_name AS created_user_last_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users assigned_user ON t.assigned_to_user_id = assigned_user.id
       LEFT JOIN users created_user ON t.created_by_user_id = created_user.id
       ${filterQuery} ORDER BY t.due_date ASC, t.priority DESC`,
      queryParams
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private (All authenticated users)
const getTaskById = async (req, res) => {
  const { id } = req.params;
  const { organization_id, id: current_user_id, role } = req.user;

  let filterQuery = 'WHERE t.id = $1 AND t.organization_id = $2';
  const queryParams = [id, organization_id];

  // If not admin or project manager, restrict to tasks assigned to or created by the user
  if (role === 'individual_contributor') {
    filterQuery += ` AND (t.assigned_to_user_id = $3 OR t.created_by_user_id = $3)`;
    queryParams.push(current_user_id);
  }

  try {
    const result = await query(
      `SELECT
        t.id, t.project_id, t.parent_task_id, t.recurring_task_id, t.title, t.description,
        t.status, t.priority, t.start_date, t.due_date, t.completed_at, t.estimated_effort_hours,
        t.assigned_to_user_id, t.created_by_user_id, t.created_at, t.updated_at,
        p.name AS project_name,
        assigned_user.first_name AS assigned_user_first_name,
        assigned_user.last_name AS assigned_user_last_name,
        created_user.first_name AS created_user_first_name,
        created_user.last_name AS created_user_last_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users assigned_user ON t.assigned_to_user_id = assigned_user.id
       LEFT JOIN users created_user ON t.created_by_user_id = created_user.id
       ${filterQuery}`,
      queryParams
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({ message: 'Server error while fetching task.' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (All authenticated users, with restrictions)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    project_id, parent_task_id, title, description, status, priority,
    start_date, due_date, completed_at, estimated_effort_hours, assigned_to_user_id
  } = req.body;
  const { organization_id, id: current_user_id, role } = req.user;

  try {
    // Check if the task exists and belongs to the organization
    const taskCheck = await query('SELECT created_by_user_id, assigned_to_user_id FROM tasks WHERE id = $1 AND organization_id = $2', [id, organization_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have access.' });
    }

    // Individual contributors can only update tasks they created or are assigned to
    if (role === 'individual_contributor' &&
        taskCheck.rows[0].created_by_user_id !== current_user_id &&
        taskCheck.rows[0].assigned_to_user_id !== current_user_id) {
      return res.status(403).json({ message: 'Forbidden: You can only update tasks you created or are assigned to.' });
    }

    // Optional: Validate project_id and assigned_to_user_id belong to the same organization
    if (project_id) {
      const projectCheck = await query('SELECT id FROM projects WHERE id = $1 AND organization_id = $2', [project_id, organization_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Project not found or does not belong to your organization.' });
      }
    }
    if (assigned_to_user_id) {
      const userCheck = await query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [assigned_to_user_id, organization_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Assigned user not found or does not belong to your organization.' });
      }
    }

    const result = await query(
      `UPDATE tasks
       SET project_id = COALESCE($1, project_id),
           parent_task_id = COALESCE($2, parent_task_id),
           title = COALESCE($3, title),
           description = COALESCE($4, description),
           status = COALESCE($5, status),
           priority = COALESCE($6, priority),
           start_date = COALESCE($7, start_date),
           due_date = COALESCE($8, due_date),
           completed_at = COALESCE($9, completed_at),
           estimated_effort_hours = COALESCE($10, estimated_effort_hours),
           assigned_to_user_id = COALESCE($11, assigned_to_user_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND organization_id = $13
       RETURNING id, title, description, status, priority, due_date, assigned_to_user_id, created_at, updated_at`,
      [project_id, parent_task_id, title, description, status, priority,
        start_date, due_date, completed_at, estimated_effort_hours, assigned_to_user_id, id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task.' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Project Manager, Admin)
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND organization_id = $2 RETURNING id`,
      [id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have access.' });
    }
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task.' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
