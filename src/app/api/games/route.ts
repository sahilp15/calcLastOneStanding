import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const roomCode: string = body.roomCode ?? generateRoomCode()

    const game = await prisma.game.create({
      data: {
        roomCode,
        status: 'WAITING',
      },
    })

    return NextResponse.json(
      { roomCode: game.roomCode, gameId: game.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/games error:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roomCode = searchParams.get('roomCode')

    if (roomCode) {
      const game = await prisma.game.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: {
          _count: { select: { players: true, rounds: true } },
        },
      })
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }
      return NextResponse.json(game)
    }

    const activeCount = await prisma.game.count({
      where: { status: { in: ['WAITING', 'IN_PROGRESS'] } },
    })
    const totalCount = await prisma.game.count()

    return NextResponse.json({ activeGames: activeCount, totalGames: totalCount })
  } catch (error) {
    console.error('GET /api/games error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
