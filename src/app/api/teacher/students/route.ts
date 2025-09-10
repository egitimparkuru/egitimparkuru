import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'
import { CreateStudentRequest, StudentProfile } from '@/lib/types'

// GET - Öğrencileri listele
export const GET = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return createErrorResponse('Token gerekli', 401)
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  console.log('🔍 Token payload:', payload)
  
  // Teacher'ın veritabanında olup olmadığını kontrol et
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  console.log('👨‍🏫 Found teacher:', teacher ? teacher.id : 'NOT FOUND')

  if (!teacher) {
    return createErrorResponse('Öğretmen bulunamadı', 404)
  }
  
  const students = await prisma.student.findMany({
    where: {
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  return createSuccessResponse(students, 'Öğrenciler başarıyla getirildi')
})

// POST - Yeni öğrenci oluştur
export const POST = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return createErrorResponse('Token gerekli', 401)
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // Teacher'ın veritabanında olup olmadığını kontrol et
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  if (!teacher) {
    return createErrorResponse('Öğretmen bulunamadı', 404)
  }
  
  const body = await request.json()
  
  // Validation
  const requiredFields: (keyof CreateStudentRequest)[] = ['firstName', 'lastName', 'email', 'password']
  try {
    validateRequestBody<CreateStudentRequest>(body, requiredFields)
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Validation failed', 
      400
    )
  }

  const { firstName, lastName, email, password, registrationDate, grade, city, notes } = body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 400)
  }

  // Hash the provided password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  })

  // Create student
  const student = await prisma.student.create({
    data: {
      userId: user.id,
      teacherId: teacher.id,
      registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
      grade: grade || null,
      city: city || null,
      notes: notes || null
    },
    include: {
      user: true
    }
  })

  return createSuccessResponse(student, 'Öğrenci başarıyla oluşturuldu')
})