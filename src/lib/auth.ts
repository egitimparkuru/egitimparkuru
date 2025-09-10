import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'edutracktpro',
    audience: 'edutracktpro-users'
  })
}

export function verifyToken(token: string): JWTPayload {
  try {
    console.log('🔑 Verifying token:', token.substring(0, 20) + '...')
    console.log('🔑 JWT_SECRET:', JWT_SECRET)
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'edutracktpro',
      audience: 'edutracktpro-users'
    }) as JWTPayload
    
    console.log('✅ Token verified:', decoded)
    return decoded
  } catch (error) {
    console.error('❌ Token verification failed:', error)
    throw new AuthError('Invalid or expired token')
  }
}

export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader || typeof authHeader !== 'string') {
    throw new AuthError('Authorization header is required')
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Invalid authorization header format')
  }
  
  return authHeader.substring(7)
}

export function createSessionToken(userId: string): string {
  return jwt.sign({ userId, type: 'session' }, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'edutracktpro',
    audience: 'edutracktpro-sessions'
  })
}

export function verifySessionToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'edutracktpro',
      audience: 'edutracktpro-sessions'
    }) as { userId: string; type: string }
    
    if (decoded.type !== 'session') {
      throw new AuthError('Invalid session token type')
    }
    
    return { userId: decoded.userId }
  } catch (error) {
    throw new AuthError('Invalid or expired session token')
  }
}

