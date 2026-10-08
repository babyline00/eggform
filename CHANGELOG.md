# Changelog

All notable changes to EggForm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-09-27

### Added — Initial Production Release

#### User Platform
- Registration with phone + email + referral code
- OTP verification (6-digit, 30s expiry, 5 attempts max)
- Login with email/phone + password (NextAuth credentials provider)
- User dashboard with KPI cards (coins, PKR balance, incubations, animals)
- Farm view with grid visualization, buildings list, animal collection
- Eggs shop (5 rarities: Basic/Silver/Golden/Diamond/Legendary)
- My Eggs tab with formation progress bars and care actions (feed/water/warm/boost)
- Incubators view (4 tiers: Basic/Advanced/Premium/Legendary with capacity + speed)
- Animals view with collect production + upgrade flows
- Inventory with type filters + sort (newest/oldest/quantity)
- Marketplace (browse, search, filter by rarity, list items, buy with 5% fee)
- Game wallet (coins/gems/tickets) with transaction history
- PKR wallet with available/pending/locked balances, deposit/withdraw flows
- Mission system (daily/weekly/one-time) with reward claiming
- Profile with security settings (2FA, PIN, biometric, device management)
- Notifications dropdown with unread badge
- Referral code with copy-to-clipboard

#### Admin Panel
- Dashboard KPIs (users, deposits, withdrawals, revenue, marketplace activity)
- User management table
- Deposits table with status badges
- Withdrawals table with approve/reject actions (creates audit log entries)
- KYC review queue
- Egg/Animal configuration tables
- Marketplace overview
- Immutable audit log viewer
- System settings panel

#### Backend Architecture
- Full Prisma schema (39 models) covering identity, farm, eggs, animals, marketplace, dual wallets, KYC, notifications, admin
- Server-controlled formation timers (epoch ms, never trust client)
- Transaction ledger pattern for both game and PKR wallets
- Atomic Prisma transactions for all multi-step operations
- Dual wallet strict separation (game vs PKR)
- Risk-based withdrawal approval workflow

#### API Routes
- `POST /api/auth/[...nextauth]` — NextAuth credentials login
- `GET/POST /api/eggs` — Egg catalog + buy (transactional)
- `POST /api/marketplace` — List/buy with atomic ownership transfer
- `POST /api/pkr/deposit` — Initiate deposit (funds → pending)
- `POST /api/pkr/withdraw` — Request withdrawal (risk scoring + KYC check)
- `POST /api/pkr/webhook` — Payment provider webhook (HMAC signature verification, idempotency, atomic ledger update)
- `POST /api/kyc/upload` — File upload with type/size/extension/magic-bytes validation
- `PATCH /api/profile` — Whitelisted field updates only
- `POST /api/missions/claim` — Atomic reward crediting
- `POST /api/jobs` — Background job submission to worker service
- `GET /api/health` — System health check (DB + realtime + worker)

#### Real-Time Service (port 3001)
- Socket.io server with per-user notification routing
- In-memory notification queue for offline users
- Health check endpoint
- Event types: egg_ready, production_ready, marketplace_sale, deposit_completed, withdrawal_update, mission_complete, event_started, security_alert

#### Background Worker (port 3002)
- In-memory job queue (production: replace with BullMQ + Redis)
- Job types: check_egg_formation, generate_production, reset_daily_missions, send_notification, cleanup_expired_listings, cleanup_stale_sessions, generate_report
- Retry with exponential backoff (max 3 attempts)
- Timeout enforcement (30s default)
- Idempotency via dedupeKey
- Scheduled jobs (daily mission reset, hourly cleanups)
- HTTP API for job submission + stats

#### Security
- NextAuth credentials provider with bcrypt password hashing (production: Argon2id)
- JWT sessions (7-day expiry)
- Middleware-based security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Middleware-based rate limiting on auth/payment/upload endpoints
- File upload validation (type, size, extension, magic bytes)
- Server-generated filenames for uploads (outside web root)
- Audit logging for all sensitive admin actions
- HMAC SHA-256 webhook signature verification (timing-safe)
- Webhook idempotency + timestamp validation (5-min window)
- Risk scoring for withdrawals (KYC + amount + method + frequency)

#### Frontend Architecture
- Mobile-first responsive design with bottom navigation on mobile
- Light/dark theme via next-themes (farm palette: amber/cream/forest — no blue/indigo)
- Framer Motion animations (egg bobbing, hatching, page transitions, decorative orbits)
- Zustand store with persist (offline-friendly state)
- Real-time notification indicator (green dot on bell when connected)
- 13 views with consistent SectionHeader + StatCard + EggCard + AnimalCard components
- Sticky footer with safe-area-inset for iOS

#### Documentation
- README.md with quick start, project structure, API reference
- ARCHITECTURE.md with system topology, data model, dual-wallet diagram, payment/withdrawal flows, security boundaries
- SECURITY.md with threat model, auth details, RBAC, fraud detection, incident response
- DEPLOYMENT.md with production setup, Nginx config, PM2, SSL, backups, CI/CD, rollback, compliance checklist
- .env.example with all required + optional env vars documented

### Engineering Standards Applied
- Dual wallet strict separation (§19, §84)
- Server-controlled timers (§11, §62)
- Transaction ledger pattern (§24, §63, §64)
- Webhook signature verification + idempotency (§26)
- Withdrawal risk scoring + manual admin approval (§23, §43)
- Audit log for sensitive admin actions (§60)
- File upload validation (§17)
- Rate limiting on abuse-prone endpoints (§9, §10)
- Security headers (§10)
- Atomic Prisma transactions for multi-step operations (§7)
- Server-side authorization enforcement (§10, §62)
- Idempotent operations (§1, §20)
- Mobile-first responsive design (§37, §57)
- Light/dark theme with system preference detection
- Accessible components (semantic HTML, ARIA where needed, keyboard nav, focus states)

### Known Limitations
- In-memory job queue (replace with BullMQ + Redis for production)
- In-memory rate limiting (replace with Redis for multi-instance)
- SQLite database (replace with PostgreSQL for production)
- Local file storage for KYC docs (replace with S3/R2)
- Demo OTP (any 6 digits accepted; production needs real SMS provider)
- No real payment integration (webhook route scaffolded; plug in JazzCash/Easypaisa SDK)
- No automated tests yet (manual QA via Agent Browser)
- No WebSocket adapter for multi-instance (single server only)
