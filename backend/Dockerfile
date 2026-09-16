# Backend Tier Dockerfile
# Uses a multi-stage-friendly, production-oriented Node.js image.

# Use the official Node.js 20 Alpine image (small footprint)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for Docker layer caching).
# If package.json hasn't changed, Docker reuses the cached npm install layer,
# making rebuilds much faster.
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --production

# Copy application source code
COPY src/ ./src/

# Create a non-root user for security.
# Running as root inside a container is a security risk — if an attacker
# escapes the app, they'd have root access to the container.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose port 3000 (documentation; actual mapping is in docker-compose)
EXPOSE 3000

# Start the Express server
CMD ["node", "src/server.js"]
