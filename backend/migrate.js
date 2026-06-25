const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/generated_db';

// Path to the SQL schema file
// Assumes migrate.js is in 'backend/' and schema.sql is in 'database/'
const schemaFilePath = path.join(__dirname, '../database/schema.sql');

async function migrate() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        console.log('Attempting to connect to the PostgreSQL database...');
        await client.connect();
        console.log('Successfully connected to the database.');

        console.log(`Reading SQL schema from ${schemaFilePath}...`);
        const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');
        console.log('SQL schema read successfully. Executing migration...');

        // Execute the entire schema.sql content
        // The pg client can handle multiple statements separated by semicolons
        await client.query(schemaSql);
        console.log('Database migration completed successfully! All tables and types created/updated.');

    } catch (err) {
        console.error('Database migration failed:', err.message);
        console.error('Error details:', err);
        process.exit(1); // Exit with a failure code
    } finally {
        console.log('Closing database connection.');
        await client.end();
    }
}

// Execute the migration script
migrate();

/*
To run this migration script:
1. Ensure you have the 'pg' package installed: `npm install pg`
2. Make sure your PostgreSQL database is running and accessible at the specified connection string.
3. You can run it directly from your terminal: `node backend/migrate.js`

Optional package.json update for convenience:
Add a script to your package.json:
"scripts": {
  "migrate": "node backend/migrate.js",
  "start": "npm run migrate && node server.js" // Example if you want to run migration before starting your app
}
Then you can run `npm run migrate` or `npm start` (if you updated the start script).
*/
