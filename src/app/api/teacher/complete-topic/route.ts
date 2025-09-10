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
    const { studentId, topicId } = body

    // Gerekli alanları kontrol et
    if (!studentId || !topicId) {
      return NextResponse.json(
        { error: 'Öğrenci ID ve Konu ID gerekli' },
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

    // Konunun var olduğunu kontrol et
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Konu bulunamadı' },
        { status: 404 }
      )
    }

    // Progress kaydını güncelle veya oluştur
    const progress = await prisma.studentProgress.upsert({
      where: {
        studentId_topicId: {
          studentId,
          topicId
        }
      },
      update: {
        status: 'completed',
        completedAt: new Date()
      },
      create: {
        studentId,
        topicId,
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Konu tamamlandı olarak işaretlendi'
    })

  } catch (error) {
    console.error('Complete topic error:', error)
    return NextResponse.json(
      { error: 'Konu tamamlanırken hata oluştu' },
      { status: 500 }
    )
  }
}
