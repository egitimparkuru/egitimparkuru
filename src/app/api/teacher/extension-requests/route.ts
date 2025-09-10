import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, AuthError } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Token doğrulama
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    // Sadece öğretmenler erişebilir
    if (payload.role !== 'TEACHER') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Teacher'ın veritabanında olup olmadığını kontrol et
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json({
        success: false,
        error: 'Öğretmen bulunamadı'
      }, { status: 404 })
    }

    // Öğretmenin ek süre taleplerini getir
    const extensionRequests = await prisma.extensionRequest.findMany({
      where: {
        teacherId: teacher.id
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        task: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: extensionRequests
    })

  } catch (error) {
    console.error('Extension requests fetch error:', error)
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Token doğrulama
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    // Sadece öğretmenler erişebilir
    if (payload.role !== 'TEACHER') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Teacher'ın veritabanında olup olmadığını kontrol et
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json({
        success: false,
        error: 'Öğretmen bulunamadı'
      }, { status: 404 })
    }

    const body = await request.json()
    const { requestId, action, approvedDays, response } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ek süre talebini bul
    const extensionRequest = await prisma.extensionRequest.findUnique({
      where: { id: requestId },
      include: { task: true }
    })

    if (!extensionRequest) {
      return NextResponse.json(
        { success: false, message: 'Extension request not found' },
        { status: 404 }
      )
    }

    // Talebi güncelle
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      respondedAt: new Date(),
      response: response || null
    }

    if (action === 'approve' && approvedDays) {
      updateData.approvedDays = approvedDays
      // Görevin yeni teslim tarihini hesapla
      const newDueDate = new Date(extensionRequest.task.dueDate)
      newDueDate.setDate(newDueDate.getDate() + approvedDays)
      updateData.newDueDate = newDueDate

      // Görevin teslim tarihini güncelle
      await prisma.task.update({
        where: { id: extensionRequest.taskId },
        data: { dueDate: newDueDate }
      })
    }

    const updatedRequest = await prisma.extensionRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        student: {
          include: {
            user: true
          }
        },
        task: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: action === 'approve' ? 'Extension request approved' : 'Extension request rejected'
    })

  } catch (error) {
    console.error('Extension request update error:', error)
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
