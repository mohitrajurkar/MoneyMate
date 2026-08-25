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

#### Linux / macOS:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=moneymate
export DB_USERNAME=postgres
export DB_PASSWORD=your_postgres_password
export GEMINI_API_KEY=your_optional_gemini_api_key
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

### 4. Start the React Frontend

In the project root directory:

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:3000` or `http://localhost:5173`.

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
