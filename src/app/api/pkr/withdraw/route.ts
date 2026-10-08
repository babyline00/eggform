// POST /api/pkr/withdraw — Request a PKR withdrawal
// Implements §23 (PKR Withdrawal) with risk scoring, KYC requirement,
// admin approval workflow, and atomic ledger update.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, amountPaisa, method, methodReference } = body as {
    userId?: string
    amountPaisa?: number
    method?: string
    methodReference?: string
  }

  // Boundary validation (engineering §9, §10)
  if (!userId || !amountPaisa || !method || !methodReference) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (typeof amountPaisa !== 'number' || amountPaisa < 50000) {
    return NextResponse.json({ error: 'Minimum withdrawal is Rs 500' }, { status: 400 })
  }
  if (amountPaisa > 1_000_000_00) {
    return NextResponse.json({ error: 'Maximum withdrawal is Rs 1,000,000 per request' }, { status: 400 })
  }
  const allowedMethods = ['bank', 'easypaisa', 'jazzcash', 'card']
  if (!allowedMethods.includes(method)) {
    return NextResponse.json({ error: 'Unsupported withdrawal method' }, { status: 400 })
  }

  try {
    const wallet = await db.pkrWallet.findUnique({
      where: { userId },
      include: { user: { include: { kyc: true } } },
    })
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check available balance
    if (wallet.available < amountPaisa) {
      return NextResponse.json({ error: 'Insufficient available balance' }, { status: 400 })
    }

    // KYC requirement check (§27)
    const kycVerified = wallet.user.kyc?.status === 'verified'
    if (!kycVerified && amountPaisa > 50000) {
      return NextResponse.json({
        error: 'KYC verification required for withdrawals over Rs 500',
        requiresKyc: true,
      }, { status: 403 })
    }

    // Risk scoring (simplified — production: use ML model)
    let riskScore = 0
    if (!kycVerified) riskScore += 30
    if (amountPaisa > 100_000_00) riskScore += 20  // > Rs 100k
    if (amountPaisa > 500_000_00) riskScore += 30  // > Rs 500k
    if (method === 'card') riskScore += 10
    // Check recent withdrawal frequency (production: query last 24h count)
    // Check device fingerprint consistency
    // Check for unusual IP / location

    // Fee: Rs 5 for bank, Rs 10 for wallet, Rs 15 for card (production: from SystemSetting)
    const feeMap: Record<string, number> = { bank: 500, easypaisa: 1000, jazzcash: 1000, card: 1500 }
    const fee = feeMap[method]
    const netAmount = amountPaisa - fee

    // Atomic transaction: lock funds, create withdrawal record
    const withdrawal = await db.$transaction(async (tx) => {
      // Lock the amount from available -> locked bucket
      const updatedWallet = await tx.pkrWallet.update({
        where: { id: wallet.id },
        data: {
          available: { decrement: amountPaisa },
          locked: { increment: amountPaisa },
        },
      })

      const wd = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: amountPaisa,
          fee,
          netAmount,
          method,
          methodReference: maskAccount(methodReference),
          kycRequired: !kycVerified,
          riskScore,
          status: riskScore >= 50 ? 'under_review' : 'pending',
        },
      })

      return { withdrawal: wd, wallet: updatedWallet }
    })

    // Enqueue background notification job
    await fetch(`http://localhost:3002/jobs?XTransformPort=3002`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'send_notification',
        payload: {
          userId,
          type: 'withdrawal_update',
          title: '💸 Withdrawal Requested',
          message: `Your withdrawal of Rs ${(amountPaisa / 100).toLocaleString()} is ${withdrawal.withdrawal.status === 'under_review' ? 'under review' : 'pending'}.`,
        },
        dedupeKey: `wd-${withdrawal.withdrawal.id}`,
      }),
    }).catch(() => null)

    return NextResponse.json({
      withdrawal: withdrawal.withdrawal,
      riskScore,
      fee,
      netAmount,
      message: 'Withdrawal requested. Funds are locked pending review.',
    })
  } catch (e) {
    console.error('[POST /api/pkr/withdraw] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Mask account reference for security (e.g., "1234567890" -> "****7890")
function maskAccount(ref: string): string {
  if (ref.length <= 4) return '****'
  return `****${ref.slice(-4)}`
}
