import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withErrorHandling, createSuccessResponse } from '@/lib/middleware'

export const POST = withAuth(
  withErrorHandling(async (req) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.substring(7) // Remove 'Bearer ' prefix
    
    if (token) {
      // Remove session from database
      await prisma.session.deleteMany({
        where: { token }
      })
    }
    
    return createSuccessResponse(null, 'Logout successful')
  })
)

