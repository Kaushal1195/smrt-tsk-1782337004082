const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all project routes
router.use(protect);

router.route('/')
  .post(authorizeRoles('admin', 'project_manager'), createProject)
  .get(getProjects); // All authenticated users can view projects

router.route('/:id')
  .get(getProjectById)
  .put(authorizeRoles('admin', 'project_manager'), updateProject)
  .delete(authorizeRoles('admin', 'project_manager'), deleteProject);

module.exports = router;
