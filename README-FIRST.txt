# EggForm — Production Build Package

This zip contains the complete EggForm codebase, ready for production deployment.

## Quick Start

```bash
# 1. Unzip
unzip eggform-production.zip
cd eggform

# 2. Install dependencies
bun install
cd mini-services/realtime-service && bun install && cd ../..
cd mini-services/worker-service && bun install && cd ../..

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your secrets (NEXTAUTH_SECRET, PAYMENT_WEBHOOK_SECRET, etc.)

# 4. (Optional) Start PostgreSQL + Redis via Docker
docker compose up -d
# Then switch Prisma to PostgreSQL:
# cp prisma/schema.postgres.prisma prisma/schema.prisma
# Update DATABASE_URL in .env.local

# 5. Push database schema
bun run db:push          # SQLite (default dev)
# OR
# bun run db:migrate --name init   # PostgreSQL

# 6. Start the main app
bun run dev               # http://localhost:3000

# 7. In separate terminals, start the supporting services:
cd mini-services/realtime-service && bun run dev   # port 3001
cd mini-services/worker-service && bun run dev     # port 3002
```

## What's Included

| Path | Description |
|------|-------------|
| `src/` | Next.js 16 app (UI + API routes + middleware) |
| `prisma/` | Database schema (SQLite dev + PostgreSQL production) |
| `mini-services/realtime-service/` | Socket.io real-time service (port 3001) |
| `mini-services/worker-service/` | Background job worker (port 3002) |
| `tests/unit/` | Jest unit tests (69 tests, 4 suites) |
| `tests/e2e/` | Playwright E2E tests (30+ tests) |
| `public/` | PWA manifest + icons + assets |
| `scripts/` | PWA icon generator + zip helper |
| `docker/` | PostgreSQL init script |
| `.github/workflows/` | CI pipeline (lint + tests + build) |
| `README.md` | Project overview + quick start |
| `ARCHITECTURE.md` | System design + data model |
| `SECURITY.md` | Threat model + RBAC + compliance |
| `DEPLOYMENT.md` | 15-step production deployment guide |
| `MOBILE.md` | Flutter + React Native port guide |
| `CHANGELOG.md` | Version history |
| `.env.example` | All required env vars documented |
| `docker-compose.yml` | Local Postgres + Redis + admin UIs |

## Production Checklist (read DEPLOYMENT.md for full version)

- [ ] Set NODE_ENV=production
- [ ] Set DATABASE_URL (PostgreSQL for production)
- [ ] Set REDIS_URL (Redis for multi-instance)
- [ ] Set NEXTAUTH_SECRET (openssl rand -base64 32)
- [ ] Set PAYMENT_WEBHOOK_SECRET (openssl rand -base64 32)
- [ ] Configure JazzCash credentials (JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT)
- [ ] Configure Easypaisa credentials (EASYPAISA_STORE_ID, EASYPAISA_PASSWORD)
- [ ] Configure SMS provider (Twilio or local) for OTP
- [ ] Configure S3/R2 for KYC document storage
- [ ] Configure email provider (SendGrid/SES)
- [ ] Build: `bun run build`
- [ ] Run tests: `bun run test && bun run test:e2e`
- [ ] Deploy with PM2 / Docker / Vercel
- [ ] Configure Nginx reverse proxy
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure Cloudflare (DDoS + CDN)
- [ ] Set up backups (PostgreSQL daily)
- [ ] Set up monitoring (Sentry + health checks)

## Legal Notice

Real-money features (deposits, withdrawals, refunds) are activated ONLY where
legally and operationally supported under Pakistani and applicable regulations
(SBP, SECP, FBR, PECA 2016). The PKR wallet is a regulated payment integration
layer, NOT a promise of investment returns. Consult qualified legal counsel
before enabling real-money features.

## Test Commands

```bash
bun run lint              # ESLint
bun run test              # Jest unit tests (69 tests)
bun run test:coverage     # Unit tests with coverage
bun run test:e2e          # Playwright E2E (30+ tests)
bun run build             # Production build
```

## Version

v1.0.0 — see CHANGELOG.md for full release notes.

Built with the project-engineering standards skill (see /skills/project-engineering).
