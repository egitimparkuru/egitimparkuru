import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Teacher'ı bul
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Öğrenci ID gerekli' }, { status: 400 })
    }

    // Öğrencinin bu öğretmene ait olduğunu kontrol et
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: teacher.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Bu öğrenciye erişim yetkiniz yok' }, { status: 403 })
    }

    // Tamamlanan görevleri getir (completed ve overdue)
    const tasks = await prisma.task.findMany({
      where: {
        studentId: studentId,
        status: {
          in: ['completed', 'overdue']
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

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Completed tasks fetch error:', error)
    return NextResponse.json({ error: 'Tamamlanan görevler yüklenirken hata oluştu' }, { status: 500 })
  }
}
