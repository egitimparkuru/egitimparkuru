import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError, JWTPayload } from './auth'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader)
      const payload = verifyToken(token)
      
      // Check role permissions if specified
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = payload
      
      return handler(authenticatedReq)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
      
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader) {
    throw new AuthError('Authorization header is required')
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Invalid authorization header format')
  }
  
  return authHeader.substring(7)
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      
      // Handle known error types
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
      
      // Handle Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as any
        
        switch (prismaError.code) {
          case 'P2002':
            return NextResponse.json(
              { error: 'A record with this information already exists' },
              { status: 409 }
            )
          case 'P2025':
            return NextResponse.json(
              { error: 'Record not found' },
              { status: 404 }
            )
          default:
            return NextResponse.json(
              { error: 'Database operation failed' },
              { status: 500 }
            )
        }
      }
      
      // Generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): T {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required')
  }
  
  const missingFields = requiredFields.filter(field => 
    !(field in body) || body[field] === undefined || body[field] === null
  )
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
  
  return body as T
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message
  }, { status })
}

