const jwt = require('jsonwebtoken');
const { query } = require('../db');

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  token = req.headers.authorization.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request (without password hash)
    const userRes = await query(
      'SELECT id, organization_id, email, first_name, last_name, role, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    console.error(error);
    // If token verification fails or any other error occurs during user lookup
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to perform this action.' });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
