#!/bin/sh

echo "Running database migrations..."
node migrate.js

echo "Starting Node.js server..."
exec npm start
