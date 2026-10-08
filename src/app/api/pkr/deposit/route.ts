// POST /api/pkr/deposit — Initiate a PKR deposit
//
// Implements §22 (PKR Deposit System) and §25 (Payment Gateway Architecture).
// The frontend NEVER decides payment success. Only the payment provider webhook
// (see /api/pkr/webhook) determines the final status after signature verification.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, amountPaisa, paymentMethod } = body as {
    userId?: string
    amountPaisa?: number
    paymentMethod?: string
  }

  // Validate input at the boundary (engineering §9, §10)
  if (!userId || !amountPaisa || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (typeof amountPaisa !== 'number' || amountPaisa < 10000) {
    // Min Rs 100
    return NextResponse.json({ error: 'Minimum deposit is Rs 100' }, { status: 400 })
  }
  const allowedMethods = ['bank', 'card', 'easypaisa', 'jazzcash']
  if (!allowedMethods.includes(paymentMethod)) {
    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
  }

  try {
    // Find user wallet
    const wallet = await db.pkrWallet.findUnique({ where: { userId } })
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    const internalReference = `DEP-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`

    // Create pending deposit record
    const deposit = await db.deposit.create({
      data: {
        walletId: wallet.id,
        userId,
        amount: amountPaisa,
        currency: 'PKR',
        paymentMethod,
        internalReference,
        status: 'pending',
      },
    })

    // Move funds to pending bucket (not available yet!)
    await db.pkrWallet.update({
      where: { id: wallet.id },
      data: { pending: { increment: amountPaisa } },
    })

    // In production: call payment provider SDK here to initiate the actual
    // payment, then return the gateway URL/redirect to the client.
    // For this demo, we just return the deposit reference.

    return NextResponse.json({
      deposit,
      gatewayUrl: null, // Production: provider checkout URL
      internalReference,
      message: 'Deposit initiated. Wallet will be credited after webhook confirms.',
    })
  } catch (e) {
    console.error('[POST /api/pkr/deposit] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Helper to verify webhook signatures — used by /api/pkr/webhook
// Re-export signature verifier from lib for backwards compatibility
// (the actual implementation lives in @/lib/webhook for unit testing)
export { verifyWebhookSignature } from '@/lib/webhook'
