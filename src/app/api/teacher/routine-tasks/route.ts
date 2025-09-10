import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandling, withAuth, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { ApiResponse, RoutineTask } from '@/lib/types'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return createErrorResponse('Token bulunamadı', 401)
  }

  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)

  // Teacher'ı bul
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  if (!teacher) {
    return createErrorResponse('Öğretmen bulunamadı', 404)
  }

  // Rutin görevleri getir
  const routineTasks = await prisma.routineTask.findMany({
    where: {
      teacherId: teacher.id
    },
    include: {
      subject: {
        include: {
          class: true
        }
      },
      students: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return createSuccessResponse(routineTasks, 'Rutin görevler başarıyla getirildi')
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return createErrorResponse('Token bulunamadı', 401)
  }

  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)

  // Teacher'ı bul
  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId }
  })

  if (!teacher) {
    return createErrorResponse('Öğretmen bulunamadı', 404)
  }

  const body = await request.json()
  const { 
    name, 
    description, 
    type, 
    frequency, 
    dayOfWeek, 
    dayOfMonth, 
    time, 
    subjectId, 
    studentIds 
  } = body

  // Gerekli alanları kontrol et
  if (!name || !type || !frequency || !time || !studentIds || studentIds.length === 0) {
    return createErrorResponse('Gerekli alanlar eksik', 400)
  }

  // Öğrencilerin bu öğretmene ait olduğunu kontrol et
  const students = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      teacherId: teacher.id
    }
  })

  if (students.length !== studentIds.length) {
    return createErrorResponse('Bazı öğrenciler bulunamadı veya size ait değil', 400)
  }

  // Rutin görev oluştur
  const routineTask = await prisma.routineTask.create({
    data: {
      name,
      description: description || '',
      type,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      time,
      subjectId,
      teacherId: teacher.id,
      students: {
        connect: studentIds.map((id: string) => ({ id }))
      }
    },
    include: {
      subject: {
        include: {
          class: true
        }
      },
      students: {
        include: {
          user: true
        }
      }
    }
  })

  return createSuccessResponse(routineTask, 'Rutin görev başarıyla oluşturuldu')
})
