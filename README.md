# EggForm — Virtual Egg Farming, Gaming, Marketplace & PKR Wallet Platform

A complete virtual egg ecosystem: build a farm, hatch eggs, collect animals, trade on the marketplace, complete missions, participate in events, and manage a separate regulated PKR wallet for eligible real-money transactions.

## ⚠️ Legal Disclaimer

Real-money features (deposits, withdrawals, refunds, market trades involving PKR) are activated **only where legally and operationally supported** under Pakistani and other applicable payment, consumer-protection, tax, KYC/AML, gaming, and financial regulations. The PKR wallet is a **regulated payment integration layer**, not a promise of investment returns.

## Tech Stack

- **Web**: Next.js 16 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite for dev; PostgreSQL for production — see DEPLOYMENT.md)
- **State**: Zustand (client) + TanStack Query (server, available)
- **Auth**: NextAuth.js v4 (Credentials provider; OAuth ready)
- **Real-time**: Socket.io (mini-service on port 3001)
- **Background jobs**: In-memory queue (mini-service on port 3002; BullMQ + Redis for production)
- **Animations**: Framer Motion
- **Validation**: Zod
- **Forms**: React Hook Form

## Quick Start

```bash
# Install deps
bun install

# Push Prisma schema to SQLite
bun run db:push

# Start the main Next.js app (port 3000, auto-started)
bun run dev

# In separate terminals:
cd mini-services/realtime-service && bun install && bun run dev
cd mini-services/worker-service && bun run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
PAYMENT_WEBHOOK_SECRET=<openssl rand -base64 32>
```

## Project Structure

```
eggform/
├── prisma/schema.prisma          # Full production data model (39 models)
├── src/
│   ├── app/
│   │   ├── api/                  # REST API routes
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── eggs/             # Egg catalog + buy
│   │   │   ├── marketplace/      # List + buy
│   │   │   ├── pkr/              # deposit + withdraw + webhook
│   │   │   ├── kyc/upload        # KYC document upload
│   │   │   ├── profile           # Profile update
│   │   │   ├── missions/claim    # Mission reward claim
│   │   │   ├── jobs              # Background job submission
│   │   │   └── health            # Health check endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Main view router
│   │   └── globals.css           # Theme tokens
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── views/                # 13 page views
│   │   ├── app-shell.tsx         # Sidebar + topbar + mobile nav
│   │   ├── landing-page.tsx      # Public landing page
│   │   ├── auth-modal.tsx        # Register/login/OTP flow
│   │   └── cards.tsx             # Egg/Animal/Stat card components
│   ├── hooks/
│   │   └── use-realtime.ts       # Socket.io client hook
│   ├── lib/
│   │   ├── store.ts              # Zustand store with persist
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── game-data.ts         # Static egg/animal/mission data
│   │   ├── format.ts             # Currency + time formatters
│   │   ├── auth.ts               # NextAuth config
│   │   └── db.ts                 # Prisma client
│   └── middleware.ts             # Security headers + rate limiting
├── mini-services/
│   ├── realtime-service/         # Socket.io on port 3001
│   └── worker-service/           # Job queue on port 3002
├── uploads/kyc/                  # KYC document storage (gitignored)
└── docs/                         # Architecture, security, deployment
```

## Architecture Highlights

### Dual Wallet (§19, §84)
- **Game wallet**: virtual coins, gems, tickets — earned and spent in-game only
- **PKR wallet**: regulated payment layer with available/pending/locked buckets
- Strict separation: game balances cannot be converted to real money

### Server-Controlled State (§11, §62)
- Formation timers use `Date.now()` epoch milliseconds
- Wallet balances derived from transaction ledger, not mutable column
- Client never decides: payment success, ownership transfer, balance change

### Transaction Ledger (§24, §63)
- Every PKR movement gets an immutable `PkrTransaction` record
- Fields: type, amount (signed), balanceBefore, balanceAfter, reference, provider, status
- Audit log for every sensitive admin action (§60)

### Payment Webhook Pattern (§25, §26)
- Frontend never decides payment success
- Payment provider webhook → signature verification → idempotency check → atomic ledger update
- See `/api/pkr/webhook/route.ts`

### Anti-Cheat (§62)
```
Mobile/Web → API → Auth → Authorization → Server Validation → DB Tx → Ledger → Updated State → Client
```
Never trusts: frontend balance, timer, reward, inventory, production, ownership.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth credentials login |
| GET | `/api/eggs` | List egg types |
| POST | `/api/eggs` | Buy an egg (transactional) |
| POST | `/api/marketplace` | List or buy marketplace assets |
| POST | `/api/pkr/deposit` | Initiate PKR deposit |
| POST | `/api/pkr/withdraw` | Request PKR withdrawal (KYC + risk scoring) |
| POST | `/api/pkr/webhook` | Payment provider webhook (signature-verified) |
| POST | `/api/kyc/upload` | Upload KYC documents (file validation) |
| PATCH | `/api/profile` | Update user profile |
| POST | `/api/missions/claim` | Claim mission rewards |
| POST | `/api/jobs` | Enqueue background job |
| GET | `/api/health` | System health check (DB + realtime + worker) |

## Scripts

```bash
bun run dev         # Start dev server (port 3000)
bun run build       # Production build
bun run lint        # ESLint check
bun run db:push     # Push schema to DB
bun run db:generate # Regenerate Prisma client
bun run db:migrate  # Create migration
bun run db:reset    # Reset DB (destructive!)
```

## License

Proprietary. See LICENSE file.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [SECURITY.md](./SECURITY.md) — Security model
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment
- [CHANGELOG.md](./CHANGELOG.md) — Version history
