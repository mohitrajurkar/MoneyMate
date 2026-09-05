# MoneyMate — Minimal, Classy Personal Finance

MoneyMate is a production-ready personal finance web application featuring automatic UPI transaction parsing, financial health score metrics, multi-account banking vaults, debt/khata ledger, budget guardrails, Digital Gullak goals, and daily streak tracking.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Java 17, Spring Boot 3.2, Spring Data JPA, Spring Security (JWT), Hibernate, HikariCP, Maven
- **Database:** PostgreSQL 17
- **Deployment:** Docker, Docker Compose, Nginx Alpine

---

## ⚡ Quick Start with Docker Compose (Recommended)

Run the complete frontend, backend, and PostgreSQL database stack with one command:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start the full stack in detached mode
docker compose up -d --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend Health Check:** `http://localhost:8080/api/health`

For complete cloud deployment instructions (Render, Railway, Fly.io, Vercel, VPS), refer to the [Production Deployment Guide](DEPLOYMENT.md).

---

## 🛠️ Local Development (Bare-Metal Setup)

### Prerequisites

- **Java Development Kit (JDK):** Version 17+
- **Apache Maven:** Version 3.8+
- **PostgreSQL:** Version 14+
- **Node.js & npm:** Node.js 18+

### 1. Database Setup

1. Make sure PostgreSQL is running on `localhost:5432`.
2. Create the database:
   ```sql
   CREATE DATABASE moneymate;
   ```

### 2. Configure Environment Variables

Create `.env` from `.env.example` and configure your database credentials:

For local development, use `DB_HOST=localhost`, `DB_NAME=moneymate`, and your local PostgreSQL password. Do not put a JDBC URL in `DB_HOST`; use `DATABASE_URL` only when connecting to a hosted database.

### Connect the backend to Supabase

1. In Supabase, open **Project Settings > Database** and copy the direct PostgreSQL connection string. Use the direct connection (port `5432`) for this Spring Boot backend.
2. Put the connection string in your local `.env` as `DATABASE_URL`. The backend accepts both JDBC and standard `postgresql://` forms. Keep the password URL-encoded.
3. Set `DB_AUTO_CREATE=false`, `HIBERNATE_DDL_AUTO=update`, and `JWT_SECRET` to a random value of at least 32 characters.

```dotenv
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?user=postgres&password=YOUR_URL_ENCODED_PASSWORD&sslmode=require
DB_HOST=
DB_AUTO_CREATE=false
HIBERNATE_DDL_AUTO=update
```

When using Docker Compose with `DATABASE_URL`, leave `DB_HOST` explicitly empty so the URL is selected. Alternatively, set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD` directly to the Supabase values.
The frontend continues to call the Spring Boot API; no Supabase key is required in the browser. Do not commit `.env` or place the database password in `VITE_*` variables.

#### Linux / macOS:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=moneymate
export DB_USERNAME=postgres
export DB_PASSWORD=mohit123
```

#### Windows PowerShell:
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="moneymate"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgres_password"
$env:GEMINI_API_KEY="your_optional_gemini_api_key"
```

### 3. Start the Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

The REST API will start on `http://localhost:8080`.
Health check: `http://localhost:8080/api/health`

If the log shows `UnknownHostException` for a Supabase hostname, your `.env` is still pointing to that hosted database. Change `DB_HOST` to `localhost` for local PostgreSQL, or verify that the Supabase project and hostname are active.

### 4. Start the React Frontend

In a second terminal, from the project root directory:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

The frontend lives in `frontend/` and proxies `/api` requests to the backend at `http://localhost:8080`.

### Windows PowerShell Summary

From the project root, run the backend in one terminal:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="moneymate"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgres_password"
Set-Location backend
mvn spring-boot:run
```

Run the frontend in another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

---

## Key Features

- **Authentication:** Secure BCrypt password hashing & stateless JWT token session management.
- **Dashboard:** Real-time net worth balance, inflow, outflow, 52-week activity heatmap, and quick stats.
- **Accounts:** Multi-account management (Bank accounts, Credit Cards with credit limits, Cash, UPI wallets).
- **Transactions:** Full transactional ledger with auto-updating account balances, categories, and tags.
- **Khata / Debts:** Track lent and borrowed money, record repayments with linked bank accounts, and settlement tracking.
- **Budgets & Goals:** Monthly spending limits and Digital Gullak savings goals.
- **Subscriptions:** Recurring bill tracking with renewal cycle reminders.
- **UPI Parsing & Vision OCR:** Automatic transaction text parser and AI receipt OCR vision parsing.
- **Financial Health Score:** Algorithmic composite score measuring savings rate, budget adherence, spending consistency, and debt ratio.
- **Streak & Motivation:** Daily tracking streaks with 24-hour grace recovery and financial quotes.

---

## License

MIT License
