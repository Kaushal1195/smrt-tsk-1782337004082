const { Pool } = require('pg');

// Database connection string from environment variables
// IMPORTANT: Ensure your PostgreSQL is running on port 5433 and has a database named 'generated_db'
// and a user 'postgres' with password 'postgres'.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/generated_db';

const pool = new Pool({
  connectionString: connectionString,
});

// Test the database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process if a critical database error occurs
});

/**
 * Executes a SQL query against the database.
 * @param {string} text - The SQL query string.
 * @param {Array<any>} params - An array of parameters for the query.
 * @returns {Promise<import('pg').QueryResult>} The result of the query.
 */
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool, // Export pool for direct client access if needed (e.g., transactions)
};
