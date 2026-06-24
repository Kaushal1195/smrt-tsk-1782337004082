require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const { query } = require('./src/db'); // Removed 'connectDb' as it's not exported from db.js

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Database connection check and initial setup (optional, for development)
async function initializeDatabase() {
  try {
    // Check if the 'organizations' table exists, if not, it implies a fresh DB
    const res = await query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'organizations'
      );
    `);
    const organizationsTableExists = res.rows[0].exists;

    if (!organizationsTableExists) {
      console.log('Database tables not found. Please run the schema.sql script first.');
      // In a real application, you might run migrations here.
      // For this example, we'll assume the schema is applied manually or via a separate script.
    }

    // Ensure a default organization exists for initial user registration if needed
    const defaultOrgName = 'Default Organization';
    const orgRes = await query('SELECT id FROM organizations WHERE name = $1', [defaultOrgName]);
    if (orgRes.rows.length === 0) {
      console.log(`Creating default organization: "${defaultOrgName}"`);
      await query('INSERT INTO organizations (name, description) VALUES ($1, $2)', [defaultOrgName, 'System-generated default organization']);
    }

  } catch (error) {
    console.error('Error during database initialization:', error.message);
    // Depending on severity, you might want to exit the process here
  }
}

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Smart Task Tracker Backend API');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase(); // Perform initial DB checks/setup
});
