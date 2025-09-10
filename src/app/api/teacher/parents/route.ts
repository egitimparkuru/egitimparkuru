import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAuth, withErrorHandling, validateRequestBody } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Velileri listele
export const GET = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // Teacher'ın veritabanında olup olmadığını kontrol et
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  if (!teacher) {
    return NextResponse.json({
      success: false,
      error: 'Öğretmen bulunamadı'
    }, { status: 404 })
  }
  
  const parents = await prisma.parent.findMany({
    where: {
      teacherId: teacher.id
    },
    include: {
      user: true,
      student: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json({
    success: true,
    data: parents
  })
})

// POST - Yeni veli oluştur
export const POST = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // Teacher'ın veritabanında olup olmadığını kontrol et
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  if (!teacher) {
    console.log('Teacher not found in database')
    return NextResponse.json({
      success: false,
      error: 'Öğretmen bulunamadı'
    }, { status: 404 })
  }
  
  const body = await request.json()
  
  // Validation
  const requiredFields = ['firstName', 'lastName', 'email', 'password']
  try {
    validateRequestBody(body, requiredFields)
  } catch (error) {
    console.log('Validation error:', error)
    console.log('Body received:', body)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }, { status: 400 })
  }

  const { firstName, lastName, email, password, occupation, studentId, notes } = body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json({
      success: false,
      error: 'Bu e-posta adresi zaten kullanılıyor'
    }, { status: 400 })
  }

  // Hash provided password
  const hashedPassword = await hashPassword(password)

  try {
    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'PARENT',
        status: 'ACTIVE'
      }
    })

    // Create parent
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        teacherId: teacher.id,
        studentId: studentId || null,
        occupation: occupation || null,
        notes: notes || null
      },
      include: {
        user: true,
        student: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: parent,
      message: 'Veli başarıyla oluşturuldu'
    })
  } catch (error) {
    console.error('Parent creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Veli oluşturulurken bir hata oluştu'
    }, { status: 500 })
  }
})