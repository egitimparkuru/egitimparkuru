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

// GET /api/teacher/tests - Testleri listele
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tests = await prisma.test.findMany({
      where: {
        teacherId: user.id
      },
      include: {
        questions: true,
        attempts: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Test istatistiklerini hesapla
    const testsWithStats = tests.map(test => {
      const completedAttempts = test.attempts.filter(attempt => attempt.status === 'completed')
      const averageScore = completedAttempts.length > 0 
        ? completedAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / completedAttempts.length
        : 0

      return {
        id: test.id,
        title: test.title,
        description: test.description,
        subject: test.subject,
        grade: test.grade,
        duration: test.duration,
        questionCount: test.questionCount,
        status: test.status,
        createdAt: test.createdAt,
        studentCount: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        isRandomOrder: test.isRandomOrder,
        showCorrectAnswers: test.showCorrectAnswers,
        allowRetake: test.allowRetake,
        maxAttempts: test.maxAttempts
      }
    })

    return NextResponse.json({ tests: testsWithStats })
  } catch (error) {
    console.error('Test listesi hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teacher/tests - Yeni test oluştur
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subject, grade, duration, questionCount, isRandomOrder, showCorrectAnswers, allowRetake, maxAttempts } = body

    // Validation
    if (!title || !subject || !grade || !duration) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const test = await prisma.test.create({
      data: {
        title,
        description: description || null,
        subject,
        grade,
        duration: parseInt(duration),
        questionCount: parseInt(questionCount) || 0,
        teacherId: user.id,
        isRandomOrder: isRandomOrder || false,
        showCorrectAnswers: showCorrectAnswers !== false,
        allowRetake: allowRetake || false,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null
      }
    })

    return NextResponse.json({ test }, { status: 201 })
  } catch (error) {
    console.error('Test oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
