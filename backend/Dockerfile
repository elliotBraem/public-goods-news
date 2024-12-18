FROM oven/bun

WORKDIR /app

# Create directories for mounts
RUN mkdir -p /data
RUN mkdir -p /app/.cache
RUN chown bun:bun /data /app/.cache

# Copy package files
COPY --chown=bun:bun package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY --chown=bun:bun . .

# Set environment variables
ENV DATABASE_URL="file:/data/sqlite.db"
ENV CACHE_DIR="/app/.cache"

# Expose the port
EXPOSE 8080

# Start the application
CMD ["bun", "run", "src/index.ts"]
