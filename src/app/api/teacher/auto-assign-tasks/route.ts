import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Teacher'ı bul
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 })
    }

    // Bugünün tarihini al
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Pazar, 1 = Pazartesi, ...

    // Bugün için aktif rutin görevleri bul
    const routineTasks = await prisma.routineTask.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true,
        dayOfWeek: dayOfWeek
      },
      include: {
        students: true,
        subject: true
      }
    })

    const createdTasks = []

    // Her rutin görev için bugünkü görevi oluştur
    for (const routineTask of routineTasks) {
      // Bugün için zaten görev oluşturulmuş mu kontrol et
      const whereClause: any = {
        teacherId: teacher.id,
        startDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        },
        description: {
          contains: routineTask.name
        }
      }

      // subjectId null değilse where clause'a ekle
      if (routineTask.subjectId) {
        whereClause.subjectId = routineTask.subjectId
      }

      const existingTask = await prisma.task.findFirst({
        where: whereClause
      })

      if (existingTask) {
        continue // Zaten oluşturulmuş, atla
      }

      // Her öğrenci için görev oluştur
      for (const student of routineTask.students) {
        const startDate = new Date(today)
        const [hours, minutes] = routineTask.time.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate)
        endDate.setHours(hours + 1, minutes, 0, 0) // 1 saat süre

        const taskData: any = {
          description: routineTask.name,
          startDate: startDate,
          endDate: endDate,
          type: routineTask.type,
          resourceName: 'Rutin Görev',
          studentId: student.id,
          teacherId: teacher.id,
          status: 'pending'
        }

        // subjectId null değilse ekle
        if (routineTask.subjectId) {
          taskData.subjectId = routineTask.subjectId
        }

        const task = await prisma.task.create({
          data: taskData
        })

        createdTasks.push(task)
      }
    }

    return NextResponse.json({ 
      success: true, 
      createdTasks: createdTasks.length,
      message: `${createdTasks.length} adet rutin görev otomatik olarak atandı`
    })

  } catch (error) {
    console.error('Auto assign tasks error:', error)
    return NextResponse.json({ error: 'Otomatik görev atama sırasında hata oluştu' }, { status: 500 })
  }
}
