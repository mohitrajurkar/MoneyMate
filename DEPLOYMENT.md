# MoneyMate — Production Deployment Guide

This guide covers deploying MoneyMate in production environments, containerized setups, cloud hosting providers, and security best practices.

---

## Architecture Overview

```
[ Web Browser / Mobile PWA ]
             │ (HTTPS Port 443 / HTTP Port 80)
             ▼
    ┌─────────────────┐
    │  Nginx Server   │  (Static React SPA + Gzip + Security Headers)
    └────────┬────────┘
             │ Proxy /api/*
             ▼
    ┌─────────────────┐
    │ Spring Boot API │  (Stateless JWT Auth, Port 8080)
    └────────┬────────┘
             │ JDBC Port 5432
             ▼
    ┌─────────────────┐
    │  PostgreSQL 17  │  (Persistent Storage Volume)
    └─────────────────┘
```

---

## 1. Quick Start: Docker Compose Deployment (Recommended)

The easiest way to run the entire MoneyMate production stack on a Linux/macOS/Windows server with Docker installed:

### Step 1: Clone the repository & enter directory
```bash
git clone https://github.com/moneymate-app/moneymate.git
cd moneymate
```

### Step 2: Configure Environment Secrets
Copy the example environment file:
```bash
cp .env.example .env
```

Generate a secure random 32+ character JWT secret:
```bash
openssl rand -base64 48
```

Edit `.env` with your secure credentials:
```ini
DB_PASSWORD=your_ultra_secure_postgres_password_here
JWT_SECRET=your_generated_32_char_secret_key_here
GEMINI_API_KEY=your_optional_gemini_api_key
FRONTEND_PORT=3000
```

### Step 3: Launch Stack
```bash
docker compose up -d --build
```

### Step 4: Verify Deployment
- **Frontend App:** Visit `http://your-server-ip:3000` (or `http://localhost:3000`)
- **Backend API Health:** Visit `http://your-server-ip:8080/api/health`
- **View Container Logs:**
  ```bash
  docker compose logs -f
  ```

To shut down the stack:
```bash
docker compose down
```

---

## 2. Cloud Platform Deployments

### A. Deploy on Render / Railway / Fly.io

MoneyMate is designed to run seamlessly on cloud container platforms.

#### 1. Database Setup (e.g. Neon, Supabase, Render, Railway, AWS RDS):
Create a PostgreSQL instance (e.g., on [Neon](https://neon.tech)).
Copy your connection credentials or endpoint hostname.

#### 2. Backend Web Service on Render:
- **Environment:** Docker
- **Dockerfile Path:** `backend/Dockerfile`
- **Docker Context Directory:** `backend`
- **Environment Variables (Dedicated Neon Configuration - Recommended):**
  - `DB_HOST`: `ep-xxxx-xxxx-123456.us-east-2.aws.neon.tech`
  - `DB_PORT`: `5432`
  - `DB_NAME`: `neondb`
  - `DB_USERNAME`: `<your_neon_db_user>`
  - `DB_PASSWORD`: `<your_neon_db_password>`
  - `NEON_ENDPOINT_ID`: `ep-xxxx-xxxx-123456` (first part of your Neon hostname)
  - `DB_SSLMODE`: `require`
  - `JWT_SECRET`: `<generated_jwt_secret>` (minimum 32 characters, e.g. `openssl rand -base64 48`)
  - `HIBERNATE_DDL_AUTO`: `update`
  - `GEMINI_API_KEY`: `<your_gemini_api_key>` (optional)
  *(Note: You can safely delete or omit `SPRING_DATASOURCE_URL`. `CORS_ALLOWED_ORIGINS` can be added after the frontend is deployed).*
- **Health Check Path:** `/api/health`
- **Port:** `8080` (Render dynamically assigns `$PORT` at runtime)

#### 3. Frontend Web Service (or Static Site on Vercel / Netlify / Cloudflare Pages):
- **Option 1 (Docker):** Deploy root `Dockerfile`.
- **Option 2 (Static Hosting on Vercel/Netlify):**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_URL=https://your-backend-domain.com`

---

## 3. Production Security Checklist

- [ ] **JWT Secret:** Replaced default secret in `JWT_SECRET` with a secure random key (`openssl rand -base64 48`).
- [ ] **Database Password:** Set a strong password for `DB_PASSWORD`.
- [ ] **CORS Restrictions:** Set `CORS_ALLOWED_ORIGINS` to exact production domain(s) (e.g., `https://moneymate.example.com`).
- [ ] **SSL / TLS Termination:** Ensure HTTPS is enabled using Certbot / Let's Encrypt or a Cloudflare / AWS CloudFront proxy.
- [ ] **Data Persistence:** Verify that the `postgres_data` Docker volume is mapped to persistent block storage on your host.
- [ ] **Rate Limiting:** Backend contains built-in in-memory rate limiting (`RateLimitingFilter.java`) protecting auth and sensitive endpoints against brute force.

---

## 4. Database Maintenance & Backups

### Create a Database Backup (pg_dump):
```bash
docker exec -t moneymate-postgres pg_dump -U postgres moneymate > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database from Backup:
```bash
cat backup_file.sql | docker exec -i moneymate-postgres psql -U postgres -d moneymate
```

---

## 5. Troubleshooting & Diagnostics

### Check Container Statuses:
```bash
docker compose ps
```

### View Live Logs:
```bash
# All containers
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend Nginx only
docker compose logs -f frontend
```

### Restart a Specific Service:
```bash
docker compose restart backend
```
