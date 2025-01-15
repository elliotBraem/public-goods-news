FROM oven/bun as deps

WORKDIR /app

# Copy package files for all workspaces
COPY package.json bun.lockb turbo.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN bun install

# Build stage
FROM oven/bun as builder
WORKDIR /app

# Set NODE_ENV for build process
ENV NODE_ENV="production"

# Copy all files from deps stage including node_modules
COPY --from=deps /app ./

# Copy source code
COPY . .

# Build both frontend and backend
RUN bun run build

# Production stage
FROM oven/bun as production
WORKDIR /app

# Install LiteFS dependencies
RUN apt-get update -y && apt-get install -y ca-certificates fuse3 sqlite3

# Copy LiteFS binary
COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs

# Create directories for mounts with correct permissions
RUN mkdir -p /litefs /var/lib/litefs /public && \
    chown -R bun:bun /litefs /var/lib/litefs /public

# Copy only necessary files from builder
COPY --from=builder --chown=bun:bun /app/package.json /app/bun.lockb /app/turbo.json ./
COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/frontend/dist ./frontend/dist
COPY --from=builder --chown=bun:bun /app/backend/dist ./backend/dist

# Set environment variables
ENV DATABASE_URL="file:/litefs/db"
ENV CACHE_DIR="/litefs/cache"
ENV NODE_ENV="production"

# Expose the port
EXPOSE 3000

# Start LiteFS (runs app with distributed file system for SQLite)
ENTRYPOINT ["litefs", "mount"]
