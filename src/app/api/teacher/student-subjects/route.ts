import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Token'ı çıkar ve doğrula
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

    // URL'den studentId parametresini al
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Öğrenci ID gerekli' },
        { status: 400 }
      )
    }

    // Öğrencinin bu öğretmene ait olduğunu kontrol et
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: teacher.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Öğrencinin atanmış derslerini getir
    const studentSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: studentId,
        status: 'assigned'
      },
      include: {
        subject: {
          include: {
            class: true,
            topics: {
              include: {
                studentProgress: {
                  where: {
                    studentId: studentId
                  }
                }
              }
            }
          }
        },
        student: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // İstatistikleri hesapla
    const stats = {
      totalSubjects: studentSubjects.length,
      completedSubjects: 0,
      inProgressSubjects: 0,
      totalTopics: 0,
      completedTopics: 0
    }

    studentSubjects.forEach(studentSubject => {
      const subject = studentSubject.subject
      const topics = subject.topics
      
      stats.totalTopics += topics.length
      
      const completedTopicsInSubject = topics.filter(topic => 
        topic.studentProgress.length > 0 && 
        topic.studentProgress[0].status === 'completed'
      ).length
      
      stats.completedTopics += completedTopicsInSubject
      
      if (completedTopicsInSubject === topics.length && topics.length > 0) {
        stats.completedSubjects++
      } else if (completedTopicsInSubject > 0) {
        stats.inProgressSubjects++
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        studentSubjects,
        stats
      }
    })

  } catch (error) {
    console.error('Student subjects fetch error:', error)
    return NextResponse.json(
      { error: 'Dersler yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
