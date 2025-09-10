import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling, createSuccessResponse } from '@/lib/middleware'

export const GET = withAuth(
  withErrorHandling(async (req) => {
    const userId = req.user!.userId
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        adminProfile: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    
    return createSuccessResponse(userData)
  })
)

