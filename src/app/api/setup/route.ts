import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, createSessionToken } from '@/lib/auth'
import { withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'

interface SetupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  department?: string
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Check if system is already set up
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    return createErrorResponse('Sistem zaten kurulmuş. İlk admin kullanıcısı mevcut.', 409)
  }

  const body = await req.json()
  const { email, password, firstName, lastName, department } = validateRequestBody<SetupRequest>(body, [
    'email', 'password', 'firstName', 'lastName'
  ])

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 409)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create admin user and profile in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create admin user
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN'
      }
    })

    // Create admin profile
    await tx.admin.create({
      data: {
        userId: user.id,
        permissions: JSON.stringify(['all']), // Full admin permissions
        department: department || 'Sistem Yönetimi'
      }
    })

    return user
  })

  // Generate tokens
  const accessToken = generateToken({
    userId: result.id,
    email: result.email,
    role: result.role
  })

  const sessionToken = createSessionToken(result.id)

  // Store session
  await prisma.session.create({
    data: {
      userId: result.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  // Prepare user data
  const userData = {
    id: result.id,
    email: result.email,
    firstName: result.firstName,
    lastName: result.lastName,
    role: result.role,
    status: result.status,
    createdAt: result.createdAt
  }

  return createSuccessResponse({
    user: userData,
    accessToken,
    sessionToken
  }, 'Sistem başarıyla kuruldu ve ilk admin kullanıcısı oluşturuldu')
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Check if system is already set up
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  return createSuccessResponse({
    isSetup: !!existingAdmin
  })
})

