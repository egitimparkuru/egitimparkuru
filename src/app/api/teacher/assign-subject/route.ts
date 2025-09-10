import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { studentId, subjectId } = body

    // Gerekli alanları kontrol et
    if (!studentId || !subjectId) {
      return NextResponse.json(
        { error: 'Öğrenci ID ve Ders ID gerekli' },
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

    // Dersin var olduğunu kontrol et
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        topics: true
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      )
    }

    console.log('Subject found:', subject.name, 'Topics count:', subject.topics?.length)

    // Ders ataması zaten var mı kontrol et
    const existingAssignment = await prisma.studentSubject.findUnique({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Bu ders zaten öğrenciye atanmış' },
        { status: 400 }
      )
    }

    // Ders atamasını oluştur
    const assignment = await prisma.studentSubject.create({
      data: {
        studentId,
        subjectId,
        status: 'assigned'
      },
      include: {
        subject: {
          include: {
            class: true,
            topics: true
          }
        },
        student: {
          include: {
            user: true
          }
        }
      }
    })

    // Tüm konular için progress kayıtları oluştur
    const progressRecords = await Promise.all(
      subject.topics.map(topic =>
        prisma.studentProgress.create({
          data: {
            studentId,
            topicId: topic.id,
            status: 'pending'
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: {
        assignment,
        progressRecords: progressRecords.length
      },
      message: 'Ders başarıyla atandı'
    })

  } catch (error) {
    console.error('Subject assignment error:', error)
    return NextResponse.json(
      { error: 'Ders atanırken hata oluştu' },
      { status: 500 }
    )
  }
}
