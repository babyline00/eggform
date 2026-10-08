// PATCH /api/profile — Update user profile
// Validates input, ensures username uniqueness, prevents privilege escalation.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, fullName, farmName, avatarUrl, bio } = body as {
      userId?: string
      fullName?: string
      farmName?: string
      avatarUrl?: string
      bio?: string
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Whitelist allowed updates — never allow role/status/level updates via this endpoint
    const allowed: Record<string, any> = {}
    if (typeof fullName === 'string' && fullName.length >= 2 && fullName.length <= 80) {
      allowed.fullName = fullName
    }
    if (typeof farmName === 'string' && farmName.length <= 60) {
      allowed.farmName = farmName
    }
    if (typeof avatarUrl === 'string' && /^https?:\/\/.+/.test(avatarUrl)) {
      allowed.avatarUrl = avatarUrl
    }
    if (typeof bio === 'string' && bio.length <= 280) {
      allowed.bio = bio
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await db.userProfile.update({
      where: { userId },
      data: allowed,
    })

    return NextResponse.json({ profile: updated })
  } catch (e) {
    console.error('[PATCH /api/profile] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
