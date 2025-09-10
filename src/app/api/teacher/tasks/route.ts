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

    // Görevleri getir
    const tasks = await prisma.task.findMany({
      where: {
        studentId: studentId,
        teacherId: teacher.id
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        subject: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ error: 'Görevler yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      studentId, 
      description, 
      startDate, 
      startTime, 
      endDate, 
      endTime, 
      subject, // Frontend'den subject geliyor
      type, 
      resourceName, 
      pageStart, 
      pageEnd, 
      videoCount, 
      testCount 
    } = body

    // Gerekli alanları kontrol et
    if (!studentId || !description || !startDate || !endDate || !resourceName || !subject) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
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

    // Görev oluştur
    const task = await prisma.task.create({
      data: {
        description,
        startDate: new Date(startDate),
        startTime: startTime || null,
        endDate: new Date(endDate),
        endTime: endTime || null,
        type,
        resourceName,
        pageStart: pageStart ? parseInt(pageStart) : null,
        pageEnd: pageEnd ? parseInt(pageEnd) : null,
        videoCount: videoCount ? parseInt(videoCount) : null,
        testCount: testCount ? parseInt(testCount) : null,
        studentId,
        teacherId: teacher.id,
        subjectId: subject // subject değişkenini kullan
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ error: 'Görev oluşturulurken hata oluştu' }, { status: 500 })
  }
}
