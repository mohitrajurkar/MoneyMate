# ==============================================================================
# MoneyMate Frontend — Production Multi-Stage Dockerfile
# Stage 1: Build React 19 + TypeScript + Vite SPA Bundle
# Stage 2: Serve with Lightweight, High-Performance Nginx Alpine
# ==============================================================================

# --- Stage 1: Build Vite Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# --- Stage 2: Nginx Production Server ---
FROM nginx:1.25-alpine

# Remove default Nginx website configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
