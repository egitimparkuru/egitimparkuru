import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
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

    // Ders atamasının var olduğunu kontrol et
    const assignment = await prisma.studentSubject.findUnique({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Ders ataması bulunamadı' },
        { status: 404 }
      )
    }

    // Transaction ile tüm ilgili kayıtları sil
    await prisma.$transaction(async (tx) => {
      // Önce tüm konu ilerlemelerini sil
      await tx.studentProgress.deleteMany({
        where: {
          studentId,
          topic: {
            subjectId
          }
        }
      })

      // Sonra ders atamasını sil
      await tx.studentSubject.delete({
        where: {
          studentId_subjectId: {
            studentId,
            subjectId
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Ders ve tüm konu ilerlemeleri başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete subject error:', error)
    return NextResponse.json(
      { error: 'Ders silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
