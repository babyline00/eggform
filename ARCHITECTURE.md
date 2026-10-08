# EggForm Architecture

## High-Level Topology

```
                         EGGFORM PLATFORM
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   PUBLIC WEBSITE          USER PLATFORM          ADMIN PANEL
        │                      │                      │
   Landing Page            Dashboard              Dashboard
   About                    Farm                  Users
   Features                 Eggs                  Eggs
   FAQ                      Incubator             Animals
   Pricing                  Animals               Economy
   Terms                    Inventory             PKR Wallet
   Privacy                  Marketplace           Deposits
   Contact                  Missions              Withdrawals
                            Events                Payments
                            Wallet                KYC
                            Referrals             Reports
                            Profile               Settings
                            Support               Audit Logs
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                         API / BACKEND
                               │
       ┌────────────┬───────────┼───────────┬──────────────┐
       │            │           │           │              │
     GAME         USERS      WALLET     PAYMENT       REALTIME
       │            │           │           │              │
     Eggs         Auth        PKR         Gateway       Socket.io
     Farm         KYC         Ledger      Webhook       (port 3001)
     Animals      Profiles    Deposits    Reconcile
     Missions     Devices     Withdrawals
     Events                    │
       │                       │
       └─────────────────┐     │
                         │     │
                    MARKETPLACE │
                         │     │
                    Asset Tx   │
                         │     │
                     DATABASE  │
                         │     │
                  PostgreSQL   │
                  Redis ◄─────┘
                  Queue Workers (port 3002)
```

## Service Decomposition

| Service | Port | Responsibility |
|---------|------|----------------|
| Next.js app | 3000 | Web frontend + REST API + auth |
| Real-time service | 3001 | Socket.io for live notifications |
| Worker service | 3002 | Background jobs (egg completion, cleanup, reports) |
| PostgreSQL | 5432 | Primary data store (production) |
| Redis | 6379 | Cache + pub/sub + job queue (production) |
| S3/R2 | — | Object storage for KYC docs, images |

## Data Model

The Prisma schema contains **39 models** covering:

### Identity (5)
- `User`, `UserProfile`, `Session`, `OtpCode`, `Device`

### Farm (2)
- `Farm`, `FarmBuilding`

### Eggs & Incubators (4)
- `EggType`, `EggHatchConfig`, `Egg`, `Incubator`

### Animals (2)
- `AnimalType`, `Animal`

### Inventory (1)
- `InventoryItem`

### Engagement (4)
- `Mission`, `UserMission`, `Achievement`, `UserAchievement`
- `Event`, `EventParticipation`

### Marketplace (2)
- `MarketplaceListing`, `MarketplaceOrder`

### Game Wallet (2)
- `GameWallet`, `GameWalletTransaction`

### PKR Wallet (5)
- `PkrWallet`, `PkrTransaction`, `Deposit`, `Withdrawal`, `PaymentWebhook`

### KYC (2)
- `KycProfile`, `KycReview`

### Notifications & Support (3)
- `Notification`, `SupportTicket`, `SupportMessage`

### Admin (4)
- `AdminUser`, `AuditLog`, `SecurityEvent`, `SystemSetting`

### Promo & Referral (3)
- `PromoCode`, `PromoRedemption`, `ReferralReward`

## Dual Wallet Architecture

```
USER
 │
 ├── GAME WALLET (virtual, server-controlled)
 │      ├── Coins      (earned from production/missions/sales)
 │      ├── Gems       (premium, from rare animals/events)
 │      └── Tickets    (special-event currency)
 │
 └── PKR WALLET (regulated payment layer)
        ├── Available Balance   (free to use)
        ├── Pending Balance     (awaiting payment confirmation)
        ├── Locked Balance       (held for marketplace escrow / withdrawal review)
        └── Transaction Ledger  (immutable record of every movement)
```

**Critical rule**: Game balances can NEVER be converted to PKR. They are separate financial concepts.

## Payment Flow

```
1. User clicks Deposit in UI
2. POST /api/pkr/deposit (auth required)
   - Validate amount, method
   - Create Deposit record with status='pending'
   - Move funds to wallet.pending bucket
   - Return internalReference + gateway redirect URL
3. User redirected to payment provider
4. Provider processes payment
5. Provider sends webhook to /api/pkr/webhook
   - Verify HMAC signature (timing-safe)
   - Check idempotency (skip duplicates)
   - Validate timestamp (reject stale)
   - Find matching Deposit by internalReference
   - Validate amount + currency match
   - Atomic transaction:
     - Update Deposit.status = 'completed'
     - Move funds: pending → available
     - Create PkrTransaction ledger entry
6. Real-time notification to user
```

## Withdrawal Flow

```
1. User requests withdrawal in UI
2. POST /api/pkr/withdraw (auth + KYC required)
   - Validate amount, method, accountRef
   - Check KYC verification status
   - Calculate risk score (amount, KYC, method, frequency)
   - Compute fee (varies by method)
   - Atomic transaction:
     - Lock funds: available → locked
     - Create Withdrawal record with status='pending' or 'under_review'
   - Enqueue notification job
3. Admin reviews in admin panel
4. Admin approves/rejects via admin action
   - Approve: locked → released (out of wallet), create PkrTransaction
   - Reject: locked → available (refund)
5. Audit log entry created
6. Real-time notification to user
```

## Security Boundaries

### Application Layer
- All input validated at API boundary (Zod schemas)
- Parameterized queries via Prisma (no raw SQL)
- XSS prevention: React escapes by default; CSP header enforced
- CSRF: NextAuth uses cookies with SameSite=Lax
- SSRF prevention: no user-supplied URLs in fetch calls

### Authentication
- Passwords hashed with bcrypt (production: Argon2id)
- JWT sessions (7-day expiry)
- OTP for phone verification (6-digit, 30s expiry, max 5 attempts)
- 2FA optional, enforced for sensitive ops

### Authorization
- RBAC: user | moderator | finance_admin | content_admin | super_admin
- Server-side enforcement on every protected endpoint
- UI restrictions never trusted

### Secrets
- Never committed (see .env.example for required vars)
- NEXTAUTH_SECRET, PAYMENT_WEBHOOK_SECRET required
- Production: use AWS Secrets Manager / Vault

### Rate Limiting (middleware.ts)
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/*` | 5 | 1 min |
| `/api/pkr/deposit` | 10 | 1 min |
| `/api/pkr/withdraw` | 3 | 1 min |
| `/api/kyc/upload` | 3 | 1 hour |
| `/api/eggs` | 30 | 1 min |
| `/api/marketplace` | 30 | 1 min |

### Security Headers
- Content-Security-Policy (strict)
- Strict-Transport-Security (HSTS preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (camera, mic, geolocation restricted)

## Failure Modes

The system is designed to handle (engineering §20):
- External API failures (timeouts, circuit breakers)
- Database unavailability (graceful degradation, cached reads)
- Queue backpressure (BullMQ retry with exponential backoff)
- DNS/CDN failures (multi-region fallback)
- Duplicate user requests (idempotency keys)
- Worker crashes mid-job (transactional boundaries, dead-letter queue)
- Deployment failures (rollback procedure documented)

## Scaling Strategy

- **Vertical first**: scale up single Postgres instance
- **Read replicas**: when read load exceeds single primary
- **Cache layer**: Redis for hot reads (egg types, animal types, user sessions)
- **Queue workers**: horizontal scale of worker-service instances
- **CDN**: Cloudflare for static assets + DDoS protection
- **Microservices**: only split when team size or scale demands (engineering §3)
