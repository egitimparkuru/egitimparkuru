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

    // Tüm sınıfları getir
    const classes = await prisma.class.findMany({
      orderBy: { level: 'asc' },
      include: {
        subjects: {
          include: {
            topics: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: classes
    })

  } catch (error) {
    console.error('Classes fetch error:', error)
    return NextResponse.json(
      { error: 'Sınıflar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
