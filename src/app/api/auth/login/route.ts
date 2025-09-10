import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken, createSessionToken } from '@/lib/auth'
import { withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { LoginRequest, LoginResponse } from '@/lib/types'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json()
  const { email, password } = validateRequestBody<LoginRequest>(body, ['email', 'password'])
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      teacherProfile: true,
      studentProfile: true,
      parentProfile: true,
      adminProfile: true
    }
  })
  
  if (!user) {
    return createErrorResponse('Invalid email or password', 401)
  }
  
  // Check if user is active
  console.log('Login attempt for user:', {
    email: user.email,
    status: user.status,
    role: user.role
  })
  
  if (user.status !== 'ACTIVE') {
    console.log('Login blocked - user is not active:', user.status)
    return createErrorResponse('Account is inactive or suspended', 403)
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return createErrorResponse('Invalid email or password', 401)
  }
  
  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })
  
  const sessionToken = createSessionToken(user.id)
  
  // Store session in database
  await prisma.session.create({
    data: {
      userId: user.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  })
  
  // Prepare user data (exclude password)
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    profile: user.teacherProfile || user.studentProfile || user.parentProfile || user.adminProfile,
    createdAt: user.createdAt
  }
  
  const response: LoginResponse = {
    user: userData,
    accessToken,
    sessionToken
  }

  return createSuccessResponse(response, 'Giriş başarılı')
})

