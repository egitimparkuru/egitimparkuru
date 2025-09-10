import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

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

    // Önce öğrenciyi kontrol et
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { teacherId: true }
    })
    
    // Öğrencinin bu öğretmene ait olduğunu kontrol et
    if (student?.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Bu öğrenciye erişim yetkiniz yok' }, { status: 403 })
    }

    const studentSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: studentId,
        student: {
          teacherId: teacher.id
        }
      },
      include: {
        subject: {
          include: {
            class: true
          }
        }
      }
    })

    // Dersleri formatla
    const subjects = studentSubjects.map(ss => ({
      id: ss.subject.id,
      name: ss.subject.name,
      className: ss.subject.class.name,
      classLevel: ss.subject.class.level
    }))

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('Student subjects fetch error:', error)
    return NextResponse.json({ error: 'Dersler yüklenirken hata oluştu' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
