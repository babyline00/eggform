// POST /api/missions/claim — Claim a completed mission's rewards
//
// Atomic: marks mission as claimed, credits coins/gems/XP to wallet,
// creates game wallet transaction log.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, missionId } = body as { userId?: string; missionId?: string }

    if (!userId || !missionId) {
      return NextResponse.json({ error: 'Missing userId or missionId' }, { status: 400 })
    }

    const userMission = await db.userMission.findUnique({
      where: { userId_missionId: { userId, missionId } },
      include: { mission: true, user: { include: { gameWallet: true } } },
    })

    if (!userMission) {
      return NextResponse.json({ error: 'Mission not found for user' }, { status: 404 })
    }

    if (userMission.status !== 'completed' || userMission.claimedAt) {
      return NextResponse.json({ error: 'Mission not claimable' }, { status: 400 })
    }

    const wallet = userMission.user.gameWallet
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Atomic: claim + reward + ledger
    const result = await db.$transaction(async (tx) => {
      // Mark claimed
      const claimed = await tx.userMission.update({
        where: { id: userMission.id },
        data: { status: 'claimed', claimedAt: new Date() },
      })

      // Credit coins
      const balanceBefore = wallet.coins
      const balanceAfter = balanceBefore + userMission.mission.rewardCoins
      await tx.gameWallet.update({
        where: { id: wallet.id },
        data: {
          coins: { increment: userMission.mission.rewardCoins },
          gems: { increment: userMission.mission.rewardGems },
        },
      })

      // Log transaction
      await tx.gameWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'reward',
          amount: userMission.mission.rewardCoins,
          balanceBefore,
          balanceAfter,
          reference: userMission.mission.id,
          reason: `Mission reward: ${userMission.mission.name}`,
        },
      })

      // Award XP
      const newXp = userMission.user.xp + userMission.mission.rewardXp
      const newLevel = Math.floor(newXp / 500) + 1
      await tx.userProfile.update({
        where: { userId },
        data: {
          xp: { increment: userMission.mission.rewardXp },
          level: Math.max(userMission.user.level, newLevel),
        },
      })

      return claimed
    })

    return NextResponse.json({
      success: true,
      mission: result,
      rewards: {
        coins: userMission.mission.rewardCoins,
        gems: userMission.mission.rewardGems,
        xp: userMission.mission.rewardXp,
      },
    })
  } catch (e) {
    console.error('[POST /api/missions/claim] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
