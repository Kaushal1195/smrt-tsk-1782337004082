const { query } = require('../db');

// @desc    Create a new task dependency
// @route   POST /api/task-dependencies
// @access  Private (Project Manager, Admin)
const createTaskDependency = async (req, res) => {
  const { task_id, depends_on_task_id, dependency_type, lag_days } = req.body;
  const { organization_id } = req.user;

  if (!task_id || !depends_on_task_id || !dependency_type) {
    return res.status(400).json({ message: 'Task ID, depends on Task ID, and dependency type are required.' });
  }
  if (task_id === depends_on_task_id) {
    return res.status(400).json({ message: 'A task cannot depend on itself.' });
  }

  try {
    // Verify both tasks exist and belong to the same organization
    const tasksCheck = await query(
      `SELECT id FROM tasks WHERE (id = $1 OR id = $2) AND organization_id = $3`,
      [task_id, depends_on_task_id, organization_id]
    );

    if (tasksCheck.rows.length !== 2) {
      return res.status(404).json({ message: 'One or both tasks not found or do not belong to your organization.' });
    }

    const result = await query(
      `INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, lag_days)
       VALUES ($1, $2, $3, $4)
       RETURNING id, task_id, depends_on_task_id, dependency_type, lag_days, created_at`,
      [task_id, depends_on_task_id, dependency_type, lag_days || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'This dependency already exists.' });
    }
    console.error('Error creating task dependency:', error);
    res.status(500).json({ message: 'Server error while creating task dependency.' });
  }
};

// @desc    Get all dependencies for a specific task (tasks that depend on it, and tasks it depends on)
// @route   GET /api/tasks/:taskId/dependencies
// @access  Private (All authenticated users)
const getTaskDependencies = async (req, res) => {
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
      `SELECT td.id, td.task_id, td.depends_on_task_id, td.dependency_type, td.lag_days, td.created_at,
              t1.title AS task_title, t2.title AS depends_on_task_title
       FROM task_dependencies td
       JOIN tasks t1 ON td.task_id = t1.id
       JOIN tasks t2 ON td.depends_on_task_id = t2.id
       WHERE (td.task_id = $1 OR td.depends_on_task_id = $1) AND t1.organization_id = $2
       ORDER BY td.created_at ASC`,
      [taskId, organization_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({ message: 'Server error while fetching task dependencies.' });
  }
};

// @desc    Delete a task dependency
// @route   DELETE /api/task-dependencies/:id
// @access  Private (Project Manager, Admin)
const deleteTaskDependency = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    // Verify dependency exists and its associated tasks belong to the organization
    const dependencyCheck = await query(
      `SELECT td.id
       FROM task_dependencies td
       JOIN tasks t1 ON td.task_id = t1.id
       JOIN tasks t2 ON td.depends_on_task_id = t2.id
       WHERE td.id = $1 AND t1.organization_id = $2 AND t2.organization_id = $2`,
      [id, organization_id]
    );

    if (dependencyCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task dependency not found or does not belong to your organization.' });
    }

    const result = await query(
      `DELETE FROM task_dependencies WHERE id = $1 RETURNING id`,
      [id]
    );

    res.status(200).json({ message: 'Task dependency deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task dependency:', error);
    res.status(500).json({ message: 'Server error while deleting task dependency.' });
  }
};

module.exports = {
  createTaskDependency,
  getTaskDependencies,
  deleteTaskDependency,
};
