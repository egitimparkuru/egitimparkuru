import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// JWT secret - production'da environment variable kullanın
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Token doğrulama fonksiyonu
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET /api/teacher/tests/[id] - Test detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findFirst({
      where: {
        id: params.id,
        teacherId: user.id
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        attempts: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Test detay hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/teacher/tests/[id] - Test güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subject, grade, duration, questionCount, status, isRandomOrder, showCorrectAnswers, allowRetake, maxAttempts } = body

    // Test'in öğretmene ait olduğunu kontrol et
    const existingTest = await prisma.test.findFirst({
      where: {
        id: params.id,
        teacherId: user.id
      }
    })

    if (!existingTest) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 })
    }

    const test = await prisma.test.update({
      where: {
        id: params.id
      },
      data: {
        title: title || existingTest.title,
        description: description !== undefined ? description : existingTest.description,
        subject: subject || existingTest.subject,
        grade: grade || existingTest.grade,
        duration: duration ? parseInt(duration) : existingTest.duration,
        questionCount: questionCount ? parseInt(questionCount) : existingTest.questionCount,
        status: status || existingTest.status,
        isRandomOrder: isRandomOrder !== undefined ? isRandomOrder : existingTest.isRandomOrder,
        showCorrectAnswers: showCorrectAnswers !== undefined ? showCorrectAnswers : existingTest.showCorrectAnswers,
        allowRetake: allowRetake !== undefined ? allowRetake : existingTest.allowRetake,
        maxAttempts: maxAttempts !== undefined ? (maxAttempts ? parseInt(maxAttempts) : null) : existingTest.maxAttempts
      }
    })

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Test güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teacher/tests/[id] - Test sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test'in öğretmene ait olduğunu kontrol et
    const existingTest = await prisma.test.findFirst({
      where: {
        id: params.id,
        teacherId: user.id
      }
    })

    if (!existingTest) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 })
    }

    // Test'i sil (cascade ile questions, attempts, answers da silinecek)
    await prisma.test.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Test başarıyla silindi' })
  } catch (error) {
    console.error('Test silme hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
