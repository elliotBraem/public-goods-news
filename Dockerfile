FROM oven/bun

WORKDIR /app

# Create directories for mounts
RUN mkdir -p /data
RUN mkdir -p /app/.cache
RUN chown bun:bun /data /app/.cache

# Copy package files for all workspaces
COPY --chown=bun:bun package.json bun.lockb turbo.json ./
COPY --chown=bun:bun frontend/package.json ./frontend/
COPY --chown=bun:bun backend/package.json ./backend/

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY --chown=bun:bun . .

# Build both frontend and backend
RUN bun run build

# Set environment variables
ENV DATABASE_URL="file:/data/sqlite.db"
ENV CACHE_DIR="/app/.cache"
ENV NODE_ENV="production"

# Expose the port
EXPOSE 3000

# Start the application using the production start script
CMD ["bun", "run", "start"]
