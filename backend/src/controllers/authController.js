const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password, first_name, last_name, organization_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields (email, password).' });
  }

  try {
    // Check if user already exists
    const userExists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let organizationId;

    // Handle organization creation/selection
    if (organization_name) {
      // Check if organization exists
      let orgRes = await query('SELECT id FROM organizations WHERE name = $1', [organization_name]);
      if (orgRes.rows.length > 0) {
        organizationId = orgRes.rows[0].id;
      } else {
        // Create new organization
        const newOrgRes = await query(
          'INSERT INTO organizations (name, description) VALUES ($1, $2) RETURNING id',
          [organization_name, `Organization for ${organization_name}`]
        );
        organizationId = newOrgRes.rows[0].id;
      }
    } else {
      // Assign to a default organization if no name is provided
      const defaultOrgName = 'Default Organization';
      let defaultOrgRes = await query('SELECT id FROM organizations WHERE name = $1', [defaultOrgName]);
      if (defaultOrgRes.rows.length === 0) {
        // This case should ideally be handled by server.js initialization, but as a fallback
        const newDefaultOrgRes = await query(
          'INSERT INTO organizations (name, description) VALUES ($1, $2) RETURNING id',
          [defaultOrgName, 'System-generated default organization']
        );
        organizationId = newDefaultOrgRes.rows[0].id;
      } else {
        organizationId = defaultOrgRes.rows[0].id;
      }
    }

    // Create new user
    const newUser = await query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, organization_id, email, first_name, last_name, role, status`,
      [organizationId, email, hashedPassword, first_name, last_name, 'individual_contributor'] // Default role
    );

    const user = newUser.rows[0];

    res.status(201).json({
      id: user.id,
      organization_id: user.organization_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields (email, password).' });
  }

  try {
    // Check for user email
    const userRes = await query('SELECT id, organization_id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        organization_id: user.organization_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    id: req.user.id,
    organization_id: req.user.organization_id,
    email: req.user.email,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    role: req.user.role,
    status: req.user.status,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
