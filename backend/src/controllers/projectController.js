const { query } = require('../db');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Project Manager, Admin)
const createProject = async (req, res) => {
  const { name, description, status, start_date, due_date } = req.body;
  const { organization_id, id: created_by_user_id } = req.user;

  if (!name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  try {
    const result = await query(
      `INSERT INTO projects (organization_id, created_by_user_id, name, description, status, start_date, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, status, start_date, due_date, created_at, updated_at`,
      [organization_id, created_by_user_id, name, description, status || 'not_started', start_date, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error while creating project.' });
  }
};

// @desc    Get all projects for an organization
// @route   GET /api/projects
// @access  Private (All authenticated users)
const getProjects = async (req, res) => {
  const { organization_id } = req.user;
  const { status, search } = req.query; // Optional filters

  let filterQuery = 'WHERE organization_id = $1';
  const queryParams = [organization_id];
  let paramIndex = 2;

  if (status) {
    filterQuery += ` AND status = $${paramIndex++}`;
    queryParams.push(status);
  }
  if (search) {
    filterQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
  }

  try {
    const result = await query(
      `SELECT id, name, description, status, start_date, due_date, completed_at, created_at, updated_at
       FROM projects ${filterQuery} ORDER BY created_at DESC`,
      queryParams
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private (All authenticated users)
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `SELECT id, name, description, status, start_date, due_date, completed_at, created_at, updated_at
       FROM projects WHERE id = $1 AND organization_id = $2`,
      [id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ message: 'Server error while fetching project.' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Project Manager, Admin)
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, start_date, due_date, completed_at } = req.body;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           start_date = COALESCE($4, start_date),
           due_date = COALESCE($5, due_date),
           completed_at = COALESCE($6, completed_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND organization_id = $8
       RETURNING id, name, description, status, start_date, due_date, completed_at, created_at, updated_at`,
      [name, description, status, start_date, due_date, completed_at, id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or you do not have access.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error while updating project.' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Project Manager, Admin)
const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    const result = await query(
      `DELETE FROM projects WHERE id = $1 AND organization_id = $2 RETURNING id`,
      [id, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or you do not have access.' });
    }
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error while deleting project.' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
