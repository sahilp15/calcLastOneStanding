import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const topic = searchParams.get('topic')
    const difficulty = searchParams.get('difficulty')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}
    if (topic) where.topic = topic
    if (difficulty) where.difficulty = parseInt(difficulty, 10)

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/questions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { latex, options, answer, explanation, difficulty, topic } = body

    if (!latex || !options || !answer || !difficulty || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: latex, options, answer, difficulty, topic' },
        { status: 400 }
      )
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: 'options must be an array of exactly 4 items' },
        { status: 400 }
      )
    }

    if (!options.includes(answer)) {
      return NextResponse.json(
        { error: 'answer must be one of the options' },
        { status: 400 }
      )
    }

    if (difficulty < 1 || difficulty > 5) {
      return NextResponse.json(
        { error: 'difficulty must be between 1 and 5' },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        latex,
        options,
        answer,
        explanation: explanation ?? null,
        difficulty: Number(difficulty),
        topic,
        isActive: true,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('POST /api/questions error:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
