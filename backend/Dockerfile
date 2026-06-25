# Stage 1: Build the Node.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Ensure the migrate.js script is executable
RUN chmod +x migrate.js

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/migrate.js ./migrate.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
