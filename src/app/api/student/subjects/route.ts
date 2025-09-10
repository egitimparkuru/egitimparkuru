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

    // Student'ı bul
    const student = await prisma.student.findUnique({
      where: { userId: payload.userId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
    }

    // Atanmış dersleri getir
    const studentSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: student.id
      },
      include: {
        subject: {
          include: {
            class: true,
            topics: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // Progress bilgilerini ekle
    const subjectsWithProgress = await Promise.all(
      studentSubjects.map(async (ss) => {
        const progress = await prisma.studentProgress.findMany({
          where: {
            studentId: student.id,
            topicId: {
              in: ss.subject.topics.map(topic => topic.id)
            }
          }
        })

        const completedTopics = progress.filter(p => p.status === 'completed').length
        const totalTopics = ss.subject.topics.length
        const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

        return {
          ...ss,
          progress: {
            completedTopics,
            totalTopics,
            progressPercentage: Math.round(progressPercentage)
          }
        }
      })
    )

    return NextResponse.json({ subjects: subjectsWithProgress })
  } catch (error) {
    console.error('Student subjects fetch error:', error)
    return NextResponse.json({ error: 'Dersler yüklenirken hata oluştu' }, { status: 500 })
  }
}
