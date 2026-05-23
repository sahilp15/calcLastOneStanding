import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const question = await prisma.question.findUnique({
      where: { id },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('GET /api/questions/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { latex, options, answer, explanation, difficulty, topic, isActive } = body

    // Validate if answer is in options when both provided
    if (options && answer && !options.includes(answer)) {
      return NextResponse.json(
        { error: 'answer must be one of the options' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}
    if (latex !== undefined) data.latex = latex
    if (options !== undefined) data.options = options
    if (answer !== undefined) data.answer = answer
    if (explanation !== undefined) data.explanation = explanation
    if (difficulty !== undefined) data.difficulty = Number(difficulty)
    if (topic !== undefined) data.topic = topic
    if (isActive !== undefined) data.isActive = isActive

    const question = await prisma.question.update({
      where: { id },
      data,
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('PUT /api/questions/[id] error:', error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.question.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/questions/[id] error:', error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
