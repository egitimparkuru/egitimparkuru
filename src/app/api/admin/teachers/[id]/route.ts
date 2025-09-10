import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withAuth, withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { Decimal } from '@prisma/client/runtime/library'

interface UpdateTeacherRequest {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
  department?: string
  specialization?: string[]
  hireDate?: string
  salary?: number
  status?: 'ACTIVE' | 'INACTIVE'
}

export const PUT = withAuth(
  withErrorHandling(async (req, { params }) => {
    const { id } = params
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
      salary,
      status
    } = validateRequestBody<UpdateTeacherRequest>(body, [])

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTeacher) {
      return createErrorResponse('Öğretmen bulunamadı', 404)
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingTeacher.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 409)
      }
    }

    // Prepare update data
    const userUpdateData: any = {}
    const teacherUpdateData: any = {}

    if (email) userUpdateData.email = email
    if (firstName) userUpdateData.firstName = firstName
    if (lastName) userUpdateData.lastName = lastName
    if (phone !== undefined) userUpdateData.phone = phone
    if (status) userUpdateData.status = status

    if (password) {
      userUpdateData.password = await hashPassword(password)
    }

    if (department) teacherUpdateData.department = department
    if (specialization) teacherUpdateData.specialization = JSON.stringify(specialization)
    if (hireDate) teacherUpdateData.hireDate = new Date(hireDate)
    if (salary !== undefined) teacherUpdateData.salary = salary ? new Decimal(salary) : null

    // Update teacher and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: existingTeacher.userId },
        data: userUpdateData
      })

      // Update teacher profile
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: teacherUpdateData
      })

      return { user: updatedUser, teacher: updatedTeacher }
    })

    return createSuccessResponse({
      message: 'Öğretmen başarıyla güncellendi',
      teacher: {
        id: result.teacher.id,
        employeeId: result.teacher.employeeId,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          phone: result.user.phone,
          status: result.user.status
        }
      }
    })
  })
)

export const DELETE = withAuth(
  withErrorHandling(async (req: NextRequest) => {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return createErrorResponse('Öğretmen ID gerekli', 400)
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTeacher) {
      return createErrorResponse('Öğretmen bulunamadı', 404)
    }

    // Cascade delete: Öğretmen, öğrenciler, veliler ve tüm ilişkili veriler silinsin
    await prisma.$transaction(async (tx) => {
      // 1. Önce öğrencilerin tüm ilişkili verilerini sil
      const students = await tx.student.findMany({
        where: { teacherId: id },
        select: { id: true, userId: true }
      })

      for (const student of students) {
        // Öğrencinin görevlerini sil
        await tx.task.deleteMany({
          where: { studentId: student.id }
        })

        // Öğrencinin ders atamalarını sil
        await tx.studentSubject.deleteMany({
          where: { studentId: student.id }
        })

        // Öğrencinin ilerleme kayıtlarını sil
        await tx.studentProgress.deleteMany({
          where: { studentId: student.id }
        })

        // Öğrencinin rutin görevlerini sil (many-to-many relation)
        // Önce öğrenciyi tüm rutin görevlerden çıkar
        const routineTasks = await tx.routineTask.findMany({
          where: {
            students: {
              some: { id: student.id }
            }
          },
          select: { id: true }
        })

        for (const routineTask of routineTasks) {
          await tx.routineTask.update({
            where: { id: routineTask.id },
            data: {
              students: {
                disconnect: { id: student.id }
              }
            }
          })
        }

        // Öğrencinin test sonuçlarını sil
        await tx.testAttempt.deleteMany({
          where: { studentId: student.id }
        })

        // Öğrenci profilini sil
        await tx.student.delete({
          where: { id: student.id }
        })

        // Öğrenci kullanıcısını sil
        await tx.user.delete({
          where: { id: student.userId }
        })
      }

      // 2. Velilerin tüm ilişkili verilerini sil
      const parents = await tx.parent.findMany({
        where: { teacherId: id },
        select: { id: true, userId: true }
      })

      for (const parent of parents) {
        // Veli profilini sil
        await tx.parent.delete({
          where: { id: parent.id }
        })

        // Veli kullanıcısını sil
        await tx.user.delete({
          where: { id: parent.userId }
        })
      }

      // 3. Öğretmenin görevlerini sil
      await tx.task.deleteMany({
        where: { teacherId: id }
      })

      // 4. Öğretmenin rutin görevlerini sil
      await tx.routineTask.deleteMany({
        where: { teacherId: id }
      })

      // 5. Öğretmenin testlerini sil
      await tx.test.deleteMany({
        where: { teacherId: id }
      })

      // 6. Öğretmen profilini sil
      await tx.teacher.delete({
        where: { id }
      })

      // 7. Öğretmen kullanıcısını sil
      await tx.user.delete({
        where: { id: existingTeacher.userId }
      })
    })

    return createSuccessResponse({
      message: 'Öğretmen başarıyla silindi'
    })
  })
)

export const PATCH = withAuth(
  withErrorHandling(async (req: NextRequest) => {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return createErrorResponse('Öğretmen ID gerekli', 400)
    }
    const body = await req.json()
    const { status } = validateRequestBody<{ status: 'ACTIVE' | 'INACTIVE' }>(body, ['status'])

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTeacher) {
      return createErrorResponse('Öğretmen bulunamadı', 404)
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: existingTeacher.userId },
      data: { status }
    })

    return createSuccessResponse({
      message: `Öğretmen ${status === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı`,
      teacher: {
        id: existingTeacher.id,
        employeeId: existingTeacher.employeeId,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          status: updatedUser.status
        }
      }
    })
  })
)
