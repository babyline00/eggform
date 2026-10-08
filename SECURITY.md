# EggForm Security Model

## Threat Model Summary

| Threat | Mitigation |
|--------|-----------|
| SQL injection | Prisma ORM with parameterized queries; no raw SQL |
| XSS | React auto-escaping + strict CSP header |
| CSRF | NextAuth SameSite=Lax cookies; no cookie-based state changes from GET |
| SSRF | No user-supplied URLs in fetch calls; allowlist for outbound |
| Path traversal | Server-generated filenames for all uploads; sandboxed upload dir |
| File upload abuse | Type/size/extension/magic-bytes validation; outside web root |
| Brute force login | Rate limiting (5/min on /api/auth) + account lockout |
| OTP abuse | 30s expiry, max 5 attempts, device tracking |
| Payment fraud | Risk scoring, KYC requirement, manual admin review for high-risk |
| Webhook spoofing | HMAC SHA-256 signature verification (timing-safe) |
| Replay attacks | Timestamp validation (5-min window), idempotency keys |
| Privilege escalation | RBAC enforced server-side; UI restrictions never trusted |
| Mass assignment | Whitelist fields in PATCH endpoints |
| Insecure dependencies | `bun audit` in CI; lockfile pinned |

## Authentication

### Password Storage
- Hashed with **bcrypt** (cost factor 12) in current implementation
- **Production**: migrate to **Argon2id** (recommended by OWASP)
- Never store plaintext; never log password hashes

### Sessions
- JWT-based (NextAuth default)
- 7-day max age
- Revocable via `Session.revokedAt` column
- Stored in HTTP-only, SameSite=Lax cookies

### OTP
- 6-digit numeric code
- 30-second expiry
- Maximum 5 verification attempts
- Tracked in `OtpCode` table with `consumed` flag
- Device fingerprint recorded on first OTP-verified login

### Multi-Factor Authentication
- Optional 2FA via TOTP (Google Authenticator compatible)
- Required for: PKR withdrawals over Rs 50,000, admin login, API key generation
- Backup codes generated on enable

## Authorization (RBAC)

### Roles
| Role | Permissions |
|------|------------|
| `user` | Standard platform access |
| `moderator` | Review users, listings, tickets; no financial access |
| `finance_admin` | View/approve deposits, withdrawals, refunds; export reports |
| `content_admin` | Manage eggs, animals, missions, events, CMS |
| `super_admin` | Full access including admin management |

### Enforcement
- **Server-side only**: every API route checks role before action
- **UI hints**: client hides actions user can't perform, but server is authoritative
- **Audit logged**: every privileged action recorded in `AuditLog`

## API Security

### Authentication Required
All `/api/*` routes (except `/api/auth/*`, `/api/health`, `/api/pkr/webhook`) require:
```
Authorization: Bearer <jwt-token>
```

### Rate Limiting
Implemented in `src/middleware.ts`. See ARCHITECTURE.md for limits.

Returns `429 Too Many Requests` with:
- `Retry-After` header
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

### Input Validation
Every request body validated at the boundary:
- Types checked (typeof, instance of)
- Ranges checked (min/max)
- Formats checked (regex for emails, phones)
- Whitelisted fields only (no mass assignment)

### Output Sanitization
- Error responses never include stack traces in production
- Sensitive fields (passwordHash, paymentMethodReference) never serialized
- Account references masked (e.g., `****1234`)

## Payment Security

### Webhook Verification
```typescript
// /api/pkr/webhook/route.ts
const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
```

### Idempotency
- Every webhook checked against `providerEventId` for duplicates
- Every deposit/withdrawal has unique `internalReference`
- Every admin action has audit log entry (deduped by request_id)

### Risk Scoring (Withdrawals)
```
Base score: 0
+ 30 if not KYC verified
+ 20 if amount > Rs 100,000
+ 30 if amount > Rs 500,000
+ 10 if method is 'card' (higher chargeback risk)
+ Additional: device fingerprint mismatch, IP geolocation anomaly,
  recent withdrawal frequency, referral abuse patterns
```
Score ≥ 50 → `under_review` (manual admin approval required)

### Fund Locking
- Withdrawal request immediately moves funds `available → locked`
- No double-spend possible
- Rejection refunds: `locked → available`
- Approval releases: `locked → 0` (out of wallet)

## File Upload Security

### KYC Document Upload (`/api/kyc/upload`)
1. **Auth required**: Bearer token
2. **Rate limited**: 3 uploads per hour per user
3. **Size limit**: 5 MB max
4. **Type validation** (3 layers):
   - MIME type from `Content-Type` header
   - File extension whitelist (`.jpg`, `.jpeg`, `.png`, `.webp`)
   - **Magic bytes verification** (file content inspection)
5. **Filename**: server-generated (`{userId}-{docType}-{random16}.{ext}`)
6. **Storage location**: `/home/z/my-project/uploads/kyc/` (outside web root)
   - Production: S3 with server-side encryption
7. **Access control**: signed URLs with expiry for downloads
8. **Retention**: configurable per compliance policy
9. **Audit**: every upload logged

## Secrets Management

### Required Environment Variables
```env
DATABASE_URL=                          # Prisma connection string
NEXTAUTH_SECRET=                       # JWT signing secret (≥ 32 chars)
NEXTAUTH_URL=                          # Public URL (e.g., https://eggform.pk)
PAYMENT_WEBHOOK_SECRET=                # HMAC secret shared with payment provider
```

### Never Committed
- API keys (payment providers, SMS, email, push)
- Database passwords
- OAuth client secrets
- JWT signing secrets
- Cloud credentials (AWS, Cloudflare)

### Production Storage
- AWS Secrets Manager / HashiCorp Vault
- Rotated quarterly + on compromise
- Access logged

## Audit Logging

Every sensitive action records:
```typescript
{
  adminId: string,
  action: string,           // WITHDRAWAL_APPROVED, USER_SUSPENDED, etc.
  targetType: string,       // user, withdrawal, deposit, etc.
  targetId: string,
  beforeValue: string?,     // JSON snapshot
  afterValue: string?,      // JSON snapshot
  ip: string,
  deviceFp: string?,
  reason: string?,
  requestId: string,
  timestamp: Date
}
```

Logs are append-only. Production: ship to SIEM (Splunk, ELK).

## Fraud Detection

### Monitored Behaviors
- Multiple accounts from same device fingerprint
- Rapid deposits/withdrawals (velocity checks)
- Repeated failed payments
- Unusual marketplace activity (wash trading)
- Referral abuse (circular referrals)
- Bot activity (request patterns, headless browser detection)
- Suspicious login locations (geo-velocity)
- Excessive OTP requests

### Risk Levels
| Level | Score | Action |
|-------|-------|--------|
| Low | 0-20 | Auto-approve |
| Medium | 21-49 | Auto-approve with extra logging |
| High | 50-79 | Manual review required |
| Critical | 80+ | Auto-reject + flag account |

## Compliance Notes

**This is a development scaffold, not legal advice.**

Before activating real-money features, consult qualified Pakistani legal counsel regarding:
- SBP (State Bank of Pakistan) regulations on digital payments
- SECP (Securities and Exchange Commission of Pakistan) if applicable
- FBR (Federal Board of Revenue) tax obligations
- PEMRA / PTA content regulations if applicable
- Anti-money laundering (AML) requirements
- Know Your Customer (KYC) standards
- Consumer protection laws
- Data protection (PECA 2016)

The PKR wallet is designed as a **regulated payment integration layer**. It is NOT:
- A promise of investment returns
- A Ponzi or pyramid scheme
- A cryptocurrency exchange
- A banking service

## Incident Response

### Suspected Breach
1. Immediately revoke all active sessions (`UPDATE sessions SET revoked_at = NOW()`)
2. Rotate all secrets (NEXTAUTH_SECRET, PAYMENT_WEBHOOK_SECRET, provider keys)
3. Freeze affected user accounts (`status = 'suspended'`)
4. Lock affected wallets (`available → locked`)
5. Pull audit logs for affected users / timeframe
6. Notify compliance team + legal counsel
7. Document timeline in incident report

### Data Breach Notification
Per PECA 2016 and applicable regulations, affected users must be notified within 72 hours of breach confirmation.
