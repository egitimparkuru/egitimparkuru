import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    
    const decoded = verifyToken(token)
    return decoded
  } catch (error) {
    return null
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const user = getUserFromToken(request)
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Görevin öğretmene ait olduğunu kontrol et
    const task = await prisma.task.findFirst({
      where: {
        id,
        teacherId: user.id
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    // Görevi sil
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Görev başarıyla silindi' })
  } catch (error) {
    console.error('Görev silme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const user = getUserFromToken(request)
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Görevin öğretmene ait olduğunu kontrol et
    const task = await prisma.task.findFirst({
      where: {
        id,
        teacherId: user.id
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    // Görevi güncelle
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        startTime: body.startTime,
        endTime: body.endTime,
        subjectId: body.subject,
        type: body.type,
        resourceName: body.resourceName,
        pageStart: body.pageStart,
        pageEnd: body.pageEnd,
        videoCount: body.videoCount,
        testCount: body.testCount
      }
    })

    return NextResponse.json({ 
      message: 'Görev başarıyla güncellendi',
      task: updatedTask
    })
  } catch (error) {
    console.error('Görev güncelleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}