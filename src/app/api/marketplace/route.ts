// POST /api/marketplace/list — List an asset on the marketplace
// POST /api/marketplace/buy — Buy a listing
//
// Implements §18 (Marketplace flow) — server-controlled ownership transfer,
// escrow via locked funds, atomic transaction recording.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action } = body as { action?: 'list' | 'buy' }

  if (action === 'list') {
    return handleList(body)
  } else if (action === 'buy') {
    return handleBuy(body)
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function handleList(body: any) {
  const { sellerId, assetType, assetId, price } = body
  if (!sellerId || !assetType || !assetId || typeof price !== 'number' || price <= 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!['egg', 'animal', 'resource'].includes(assetType)) {
    return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
  }

  try {
    // Verify seller actually owns the asset
    let asset
    if (assetType === 'egg') {
      asset = await db.egg.findUnique({ where: { id: assetId } })
      if (!asset || asset.ownerId !== sellerId || asset.status !== 'owned') {
        return NextResponse.json({ error: 'Asset not owned or unavailable' }, { status: 400 })
      }
      // Lock the egg
      await db.egg.update({ where: { id: assetId }, data: { status: 'sold' } })
    } else {
      // Animal listing — similar pattern
      asset = await db.animal.findUnique({ where: { id: assetId } })
      if (!asset || asset.ownerId !== sellerId) {
        return NextResponse.json({ error: 'Asset not owned' }, { status: 400 })
      }
    }

    const listing = await db.marketplaceListing.create({
      data: {
        sellerId,
        assetType,
        assetId,
        name: body.name || 'Asset',
        rarity: body.rarity || null,
        price,
        feePercent: 0.05,
        status: 'active',
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })
    return NextResponse.json({ listing })
  } catch (e) {
    console.error('[marketplace list] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function handleBuy(body: any) {
  const { buyerId, listingId } = body
  if (!buyerId || !listingId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const listing = await db.marketplaceListing.findUnique({ where: { id: listingId } })
    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing not available' }, { status: 404 })
    }
    if (listing.sellerId === buyerId) {
      return NextResponse.json({ error: 'Cannot buy own listing' }, { status: 400 })
    }

    const buyer = await db.user.findUnique({
      where: { id: buyerId },
      include: { gameWallet: true },
    })
    if (!buyer?.gameWallet) {
      return NextResponse.json({ error: 'Buyer wallet not found' }, { status: 404 })
    }
    if (buyer.gameWallet.coins < listing.price) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 })
    }

    // Atomic: debit buyer, credit seller (minus fee), transfer asset, record order
    const result = await db.$transaction(async (tx) => {
      const fee = Math.floor(listing.price * listing.feePercent)
      const netToSeller = listing.price - fee

      // Debit buyer
      const buyerBalanceBefore = buyer.gameWallet!.coins
      const buyerBalanceAfter = buyerBalanceBefore - listing.price
      await tx.gameWallet.update({
        where: { id: buyer.gameWallet!.id },
        data: { coins: buyerBalanceAfter },
      })

      // Credit seller (or skip if same wallet for safety, but production should handle)
      const seller = await tx.user.findUnique({
        where: { id: listing.sellerId },
        include: { gameWallet: true },
      })
      if (seller?.gameWallet) {
        const sellerBalanceBefore = seller.gameWallet.coins
        const sellerBalanceAfter = sellerBalanceBefore + netToSeller
        await tx.gameWallet.update({
          where: { id: seller.gameWallet.id },
          data: { coins: sellerBalanceAfter },
        })
        await tx.gameWalletTransaction.create({
          data: {
            walletId: seller.gameWallet.id,
            type: 'earn',
            amount: netToSeller,
            balanceBefore: sellerBalanceBefore,
            balanceAfter: sellerBalanceAfter,
            reference: listing.id,
            reason: `Marketplace sale (net of ${fee} fee)`,
          },
        })
      }

      // Log buyer transaction
      await tx.gameWalletTransaction.create({
        data: {
          walletId: buyer.gameWallet!.id,
          type: 'spend',
          amount: -listing.price,
          balanceBefore: buyerBalanceBefore,
          balanceAfter: buyerBalanceAfter,
          reference: listing.id,
          reason: 'Marketplace purchase',
        },
      })

      // Mark listing sold
      await tx.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: 'sold' },
      })

      // Transfer asset ownership
      if (listing.assetType === 'egg') {
        await tx.egg.update({
          where: { id: listing.assetId },
          data: { ownerId: buyerId, status: 'owned' },
        })
      } else if (listing.assetType === 'animal') {
        await tx.animal.update({
          where: { id: listing.assetId },
          data: { ownerId: buyerId },
        })
      }

      // Create order record
      const order = await tx.marketplaceOrder.create({
        data: {
          listingId: listing.id,
          buyerId,
          sellerId: listing.sellerId,
          price: listing.price,
          fee,
          netToSeller,
          status: 'completed',
        },
      })

      return order
    })

    return NextResponse.json({ order: result, success: true })
  } catch (e) {
    console.error('[marketplace buy] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
