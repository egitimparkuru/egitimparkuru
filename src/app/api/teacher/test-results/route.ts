import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const dateFilter = searchParams.get('dateFilter') || 'all'
  const statusFilter = searchParams.get('statusFilter') || 'all'

  // Build where clause
  const where: any = {}

  if (studentId) {
    where.studentId = studentId
  }

  // Date filter
  if (dateFilter !== 'all') {
    const now = new Date()
    let startDate: Date

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      default:
        startDate = new Date(0)
    }

    where.completedAt = {
      gte: startDate
    }
  }

  // Status filter
  if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  // Get test results with related data
  const testResults = await prisma.testResult.findMany({
    where,
    include: {
      student: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      task: {
        include: {
          subject: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  })

  // Transform data for frontend
  const transformedResults = testResults.map(result => ({
    id: result.id,
    studentId: result.studentId,
    studentName: `${result.student.user.firstName} ${result.student.user.lastName}`,
    taskId: result.taskId,
    taskName: result.task.name,
    subjectName: result.task.subject?.name || 'Ders Yok',
    completedAt: result.completedAt.toISOString(),
    score: result.score,
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    wrongAnswers: result.wrongAnswers,
    duration: result.duration,
    status: result.status,
    notes: result.notes
  }))

  return createSuccessResponse(transformedResults, 'Test sonuçları başarıyla getirildi')
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { studentId, taskId, score, totalQuestions, correctAnswers, wrongAnswers, duration, status, notes } = body

  // Validate required fields
  if (!studentId || !taskId) {
    return createErrorResponse('Öğrenci ID ve görev ID gerekli', 400)
  }

  // Create test result
  const testResult = await prisma.testResult.create({
    data: {
      studentId,
      taskId,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      duration,
      status: status || 'completed',
      notes,
      completedAt: new Date()
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      task: {
        include: {
          subject: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  // Transform data for frontend
  const transformedResult = {
    id: testResult.id,
    studentId: testResult.studentId,
    studentName: `${testResult.student.user.firstName} ${testResult.student.user.lastName}`,
    taskId: testResult.taskId,
    taskName: testResult.task.name,
    subjectName: testResult.task.subject?.name || 'Ders Yok',
    completedAt: testResult.completedAt.toISOString(),
    score: testResult.score,
    totalQuestions: testResult.totalQuestions,
    correctAnswers: testResult.correctAnswers,
    wrongAnswers: testResult.wrongAnswers,
    duration: testResult.duration,
    status: testResult.status,
    notes: testResult.notes
  }

  return createSuccessResponse(transformedResult, 'Test sonucu başarıyla oluşturuldu')
})