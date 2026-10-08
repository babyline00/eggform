# EggForm Deployment Guide

## Environments

| Env | Purpose | URL | DB |
|-----|---------|-----|----|
| `development` | Local dev | http://localhost:3000 | SQLite (file:./db/custom.db) |
| `staging` | Pre-prod testing | https://staging.eggform.pk | PostgreSQL (staging cluster) |
| `production` | Live | https://eggform.pk | PostgreSQL (HA cluster) |

## Prerequisites

### Production Stack
- **Node.js 20+** (or Bun 1.3+)
- **PostgreSQL 15+** (managed: AWS RDS, DigitalOcean, Supabase)
- **Redis 7+** (for sessions cache, job queue, pub/sub)
- **Object storage**: S3, Cloudflare R2, or MinIO (for KYC docs, images)
- **CDN**: Cloudflare (recommended) — DDoS protection + edge caching
- **Domain + SSL**: Let's Encrypt (free) or paid cert
- **Payment provider accounts**: JazzCash, Easypaisa, bank integration
- **SMS provider**: For OTP (e.g., Twilio, local Pakistani provider)
- **Email provider**: For transactional email (e.g., SendGrid, AWS SES)

## Step-by-Step Production Deployment

### 1. Provision Infrastructure

```bash
# Example: DigitalOcean droplet or AWS EC2
# Recommended: 2 vCPU, 4GB RAM minimum

# Install Node.js 20 + Bun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 2. Configure Database

```bash
sudo -u postgres psql <<EOF
CREATE USER eggform WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE eggform_prod OWNER eggform;
GRANT ALL PRIVILEGES ON DATABASE eggform_prod TO eggform;
EOF
```

### 3. Configure Environment

```bash
cp .env.example .env.production
nano .env.production
```

Required values:
```env
NODE_ENV=production
DATABASE_URL=postgresql://eggform:STRONG_PASSWORD@localhost:5432/eggform_prod
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://eggform.pk
PAYMENT_WEBHOOK_SECRET=$(openssl rand -base64 32)

# Payment providers
JAZZCASH_MERCHANT_ID=...
JAZZCASH_PASSWORD=...
EASYPAISA_MERCHANT_ID=...
EASYPAISA_PASSWORD=...

# SMS / Email
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...

# Object storage
S3_BUCKET=eggform-kyc-docs
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### 4. Switch Prisma to PostgreSQL

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 5. Run Migrations

```bash
bun run db:migrate --name init
bun run db:generate
```

### 6. Seed Initial Data

```bash
bun run db:seed  # creates super_admin user, egg types, animal types, missions
```

### 7. Build Next.js

```bash
bun run build
# Output: .next/standalone/ (self-contained server.js)
```

### 8. Configure Process Manager (PM2)

```bash
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'eggform-web',
      script: '.next/standalone/server.js',
      env: { NODE_ENV: 'production', PORT: 3000 },
      instances: 2,            // scale to CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '500M',
    },
    {
      name: 'eggform-realtime',
      script: 'mini-services/realtime-service/index.ts',
      env: { NODE_ENV: 'production' },
      instances: 1,
    },
    {
      name: 'eggform-worker',
      script: 'mini-services/worker-service/index.ts',
      env: { NODE_ENV: 'production' },
      instances: 2,            // scale workers
      exec_mode: 'cluster',
    },
  ],
}

pm2 start ecosystem.config.js
pm2 save
pm2 startup  # auto-start on reboot
```

### 9. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/eggform
server {
    listen 80;
    server_name eggform.pk www.eggform.pk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eggform.pk www.eggform.pk;

    ssl_certificate /etc/letsencrypt/live/eggform.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eggform.pk/privkey.pem;

    # Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io (real-time service)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static assets (cache aggressively)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Rate limit API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limit zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

```bash
sudo ln -s /etc/nginx/sites-available/eggform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 10. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d eggform.pk -d www.eggform.pk
# Auto-renews via cron
```

### 11. Configure Cloudflare (Recommended)

- Add domain to Cloudflare
- Set DNS A record to your server IP
- Enable "Full (strict)" SSL mode
- Enable "Always Use HTTPS"
- Enable "Bot Fight Mode"
- Configure page rules for caching static assets
- Configure WAF rules for SQLi / XSS protection

### 12. Backup Strategy

```bash
# Daily PostgreSQL backup (cron)
0 3 * * * pg_dump -U eggform eggform_prod | gzip > /backups/eggform-$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "eggform-*.sql.gz" -mtime +30 -delete

# Test restoration monthly:
# gunzip < /backups/eggform-2026-09-27.sql.gz | psql -U eggform eggform_test
```

For object storage (KYC docs):
- Enable S3 versioning
- Configure cross-region replication
- Lifecycle policy: transition to Glacier after 90 days

### 13. Monitoring

#### Health Checks
```bash
# Cron: check health every 5 min, alert on failure
*/5 * * * * curl -fsS http://localhost:3000/api/health > /dev/null || \
  /usr/local/bin/alert-admin "EggForm health check failed"
```

#### Logs
- PM2 logs: `/var/log/pm2/eggform-*.log`
- Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- PostgreSQL: `/var/log/postgresql/postgresql-15-main.log`
- Ship to: Sentry (errors), Datadog (metrics), CloudWatch Logs (AWS)

#### Metrics
- PM2 monit: `pm2 monit`
- PostgreSQL: `pg_stat_statements` extension
- Application: instrument with OpenTelemetry (recommended)

### 14. CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: bun run db:generate
      # - run: bun test  # (add tests)

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/eggform
            git pull origin main
            bun install --frozen-lockfile
            bun run db:migrate deploy
            bun run build
            pm2 reload eggform-web eggform-realtime eggform-worker
```

### 15. Smoke Test After Deploy

```bash
# Health check
curl -s https://eggform.pk/api/health | jq .

# Expected:
# {
#   "status": "ok",
#   "checks": {
#     "database": { "status": "ok" },
#     "realtime": { "status": "ok" },
#     "worker": { "status": "ok" }
#   }
# }

# Test signup flow
# Test deposit flow (small amount, e.g., Rs 100)
# Test withdrawal flow (small amount, verify KYC + risk path)
# Test marketplace buy/sell
```

## Rollback Procedure

```bash
# 1. Identify the bad deployment
pm2 logs eggform-web --lines 100

# 2. Roll back to previous git commit
git log --oneline -10
git checkout <previous-stable-commit>

# 3. Rebuild + restart
bun run build
pm2 reload eggform-web

# 4. If DB migration broke things:
psql -U eggform eggform_prod -c "ROLLBACK;"
# Or restore from backup:
gunzip < /backups/eggform-2026-09-26.sql.gz | psql -U eggform eggform_prod
```

## Maintenance Mode

To temporarily disable user access (e.g., for migrations):

```sql
-- Set maintenance mode flag
UPDATE system_settings SET value = 'true' WHERE key = 'maintenance_mode';
```

The frontend should check this flag on load and show a maintenance page.

## Restricted Hosting (cPanel / Shared)

If deploying to shared hosting without Node.js:
- **Cannot run Next.js server** — use `next export` for static HTML
- Backend must be PHP, Python, or external VPS
- PKR wallet + auth must run on supported runtime (e.g., separate VPS)
- See engineering §21 for full guidance

## Compliance Checklist Before Launch

- [ ] All required env vars set in production
- [ ] HTTPS enabled with valid cert
- [ ] Database migrations tested
- [ ] Backups configured + restoration tested
- [ ] Error monitoring (Sentry) enabled
- [ ] Logging configured + shipped to log aggregator
- [ ] Security headers verified (https://securityheaders.com)
- [ ] CORS reviewed (restrict to your domain)
- [ ] Rate limiting verified
- [ ] Cron/queue workers running
- [ ] Storage permissions reviewed
- [ ] Build artifacts verified
- [ ] Cache behavior tested
- [ ] Rollback procedure documented + rehearsed
- [ ] Legal review of Terms, Privacy, Wallet Policy
- [ ] KYC vendor integrated (if real-money features active)
- [ ] Payment provider contracts signed
- [ ] Tax registration confirmed (FBR)
- [ ] Data protection registration (PECA 2016)
- [ ] Penetration test passed
