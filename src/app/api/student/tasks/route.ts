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

    // Görevleri getir
    const tasks = await prisma.task.findMany({
      where: {
        studentId: student.id
      },
      include: {
        subject: {
          include: {
            class: true
          }
        },
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

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Student tasks fetch error:', error)
    return NextResponse.json({ error: 'Görevler yüklenirken hata oluştu' }, { status: 500 })
  }
}
