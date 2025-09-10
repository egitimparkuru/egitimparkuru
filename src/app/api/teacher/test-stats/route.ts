import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  // Build where clause
  const where: any = {}
  if (studentId) {
    where.studentId = studentId
  }

  // Get basic stats
  const [
    totalTests,
    completedTests,
    testResults,
    uniqueStudents
  ] = await Promise.all([
    prisma.testResult.count({ where }),
    prisma.testResult.count({ 
      where: { 
        ...where, 
        status: 'completed' 
      } 
    }),
    prisma.testResult.findMany({
      where: {
        ...where,
        status: 'completed',
        score: { not: null }
      },
      select: {
        score: true,
        totalQuestions: true
      }
    }),
    prisma.testResult.findMany({
      where,
      select: {
        studentId: true
      },
      distinct: ['studentId']
    })
  ])

  // Calculate average score
  let averageScore = 0
  if (testResults.length > 0) {
    const totalScore = testResults.reduce((sum, result) => {
      if (result.score && result.totalQuestions) {
        return sum + (result.score / result.totalQuestions) * 100
      }
      return sum
    }, 0)
    averageScore = Math.round(totalScore / testResults.length)
  }

  const stats = {
    totalTests,
    completedTests,
    averageScore,
    totalStudents: uniqueStudents.length
  }

  return createSuccessResponse(stats, 'Test istatistikleri başarıyla getirildi')
})
