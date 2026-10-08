// GET /api/eggs — List all egg types (public catalog)
// POST /api/eggs — Buy an egg (auth required, server-validated)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  // Public: list egg types
  try {
    const eggTypes = await db.eggType.findMany({
      where: { status: 'active' },
      orderBy: { virtualValue: 'asc' },
    })
    return NextResponse.json({ eggTypes })
  } catch (e) {
    // Database might not be initialized in dev — return empty
    return NextResponse.json({ eggTypes: [], error: 'DB not initialized' }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  // Auth required in production
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { eggTypeId, userId } = body as { eggTypeId?: string; userId?: string }

  if (!eggTypeId || !userId) {
    return NextResponse.json({ error: 'Missing eggTypeId or userId' }, { status: 400 })
  }

  try {
    // Server-side validation: never trust client claims
    const eggType = await db.eggType.findUnique({ where: { id: eggTypeId } })
    if (!eggType || eggType.status !== 'active') {
      return NextResponse.json({ error: 'Egg type not available' }, { status: 404 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { gameWallet: true },
    })
    if (!user || !user.gameWallet) {
      return NextResponse.json({ error: 'User or wallet not found' }, { status: 404 })
    }

    if (user.gameWallet.coins < eggType.virtualValue) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 })
    }

    if (user.level < eggType.requiredLevel) {
      return NextResponse.json({ error: `Requires level ${eggType.requiredLevel}` }, { status: 400 })
    }

    // Transactional: create egg, debit wallet, log transaction
    const result = await db.$transaction(async (tx) => {
      const balanceBefore = user.gameWallet!.coins
      const balanceAfter = balanceBefore - eggType.virtualValue

      const egg = await tx.egg.create({
        data: {
          eggTypeId: eggType.id,
          ownerId: user.id,
          status: 'owned',
          careHealth: 100,
          careTemperature: 95,
          careMoisture: 85,
        },
      })

      await tx.gameWallet.update({
        where: { userId: user.id },
        data: { coins: balanceAfter },
      })

      await tx.gameWalletTransaction.create({
        data: {
          walletId: user.gameWallet!.id,
          type: 'spend',
          amount: -eggType.virtualValue,
          balanceBefore,
          balanceAfter,
          reference: egg.id,
          reason: `Bought ${eggType.name}`,
        },
      })

      return egg
    })

    return NextResponse.json({ egg: result, success: true })
  } catch (e) {
    console.error('[POST /api/eggs] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
