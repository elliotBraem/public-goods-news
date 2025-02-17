## NOTE
# This Dockerfile builds the frontend and backend separately,
# frontend uses npm and backend requires bun.
# This separation is a temporary solution for a Bun issue with rsbuild,
# see: https://github.com/oven-sh/bun/issues/11628 

# Frontend deps & build stage
FROM node:20 as frontend-builder
WORKDIR /app

# Copy frontend package files
COPY frontend/package.json ./frontend/

# Install frontend dependencies
RUN cd frontend && npm install

# Copy frontend source code
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Backend deps & build stage
FROM oven/bun as backend-builder
WORKDIR /app

# Copy backend package files
COPY package.json ./
COPY backend/package.json ./backend/
COPY backend/drizzle.config.ts ./backend/

# Install backend dependencies
RUN cd backend && bun install

# Copy backend source code
COPY backend ./backend

ENV NODE_ENV="production"

# Build backend
RUN cd backend && bun run build

# Production stage
FROM oven/bun as production
WORKDIR /app

# Install LiteFS dependencies
RUN apt-get update -y && apt-get install -y ca-certificates fuse3 sqlite3

# Copy LiteFS binary
COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs

# Create directories for mounts with correct permissions
RUN mkdir -p /litefs /var/lib/litefs && \
    chown -R bun:bun /litefs /var/lib/litefs

# Create volume mount points
# Set environment variables first
ENV DATABASE_URL="file:/litefs/db"
ENV FRONTEND_DIST_PATH="/app/frontend/dist"

# Copy only necessary files from builders
COPY --from=backend-builder --chown=bun:bun /app/package.json ./
COPY --chown=bun:bun curate.config.json ./

COPY --from=frontend-builder --chown=bun:bun /app/frontend/dist ./frontend/dist
COPY --from=backend-builder --chown=bun:bun /app/backend ./backend

RUN cd backend && bun install

# Expose the port
EXPOSE 3000

# Copy LiteFS configuration
COPY --chown=bun:bun litefs.yml /etc/litefs.yml

# Start LiteFS (runs app with distributed file system for SQLite)
ENTRYPOINT ["litefs", "mount"]
