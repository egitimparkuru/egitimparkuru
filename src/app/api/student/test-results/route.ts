import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    const user = verifyToken(token)
    return user
  } catch (error) {
    return null
  }
}

// GET /api/student/test-results - Öğrenci test sonuçlarını listele
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece soru çözümü tipindeki tamamlanmış görevleri getir
    const tasks = await prisma.task.findMany({
      where: {
        studentId: user.id,
        type: 'soru_cozumu',
        status: {
          in: ['completed', 'overdue']
        },
        completedAt: {
          not: null
        },
        correctAnswers: {
          not: null
        }
      },
      include: {
        subject: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Test sonuçlarını formatla
    const testResults = tasks.map(task => ({
      id: task.id,
      taskId: task.id,
      description: task.description,
      subject: task.subject?.name || 'Bilinmeyen Ders',
      grade: task.subject?.class?.name || 'Bilinmeyen Sınıf',
      testCount: task.testCount || 0,
      correctAnswers: task.correctAnswers || 0,
      wrongAnswers: task.wrongAnswers || 0,
      blankAnswers: task.blankAnswers || 0,
      totalScore: task.totalScore ? Number(task.totalScore) : 0,
      completedAt: task.completedAt?.toISOString() || '',
      status: task.status,
      resourceName: task.resourceName
    }))

    return NextResponse.json({ testResults })
  } catch (error) {
    console.error('Test sonuçları yükleme hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
