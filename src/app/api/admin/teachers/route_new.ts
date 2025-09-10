import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withAuth, withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface CreateTeacherRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  department?: string
  specialization?: string[]
  hireDate: string
  salary?: number
}

export const GET = withAuth(
  withErrorHandling(async (req) => {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return createSuccessResponse(teachers)
  })
)

export const POST = withAuth(
  withErrorHandling(async (req) => {
    const body = await req.json()
    const {
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      department,
      specialization,
      hireDate,
      salary
    } = validateRequestBody<CreateTeacherRequest>(body, [
      'email', 'password', 'firstName', 'lastName', 'hireDate'
    ])

    // Generate employee ID
    const generatedEmployeeId = `EMP${Date.now()}`

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create teacher user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: UserRole.TEACHER,
          status: 'ACTIVE'
        }
      })

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: generatedEmployeeId,
          department: department || 'Genel',
          specialization: JSON.stringify(specialization || []),
          hireDate: new Date(hireDate),
          salary: salary ? new Decimal(salary) : null
        }
      })

      return { user, teacher }
    })

    // Return success response
    return createSuccessResponse({
      message: 'Öğretmen başarıyla oluşturuldu',
      teacher: {
        id: result.teacher.id,
        employeeId: result.teacher.employeeId,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          phone: result.user.phone
        }
      }
    })
  })
)
