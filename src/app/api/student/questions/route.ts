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

    // Soruları getir
    const questions = await prisma.question.findMany({
      where: {
        studentId: student.id
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Student questions fetch error:', error)
    return NextResponse.json({ error: 'Sorular yüklenirken hata oluştu' }, { status: 500 })
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

    // Student'ı bul
    const student = await prisma.student.findUnique({
      where: { userId: payload.userId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, subjectId } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 })
    }

    // Soru oluştur
    const question = await prisma.question.create({
      data: {
        title,
        content,
        studentId: student.id,
        teacherId: student.teacherId,
        subjectId: subjectId || null
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Student question creation error:', error)
    return NextResponse.json({ error: 'Soru oluşturulurken hata oluştu' }, { status: 500 })
  }
}
