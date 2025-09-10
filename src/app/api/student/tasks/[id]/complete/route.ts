import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      throw new Error('No token provided')
    }
    const decoded = verifyToken(token)
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

// POST /api/student/tasks/[id]/complete - Görevi tamamla
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request)
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      completionNote, 
      correctAnswers, 
      wrongAnswers, 
      blankAnswers
    } = body

    // Görevin öğrenciye ait olduğunu kontrol et
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        studentId: user.id
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    // Görev zaten tamamlanmış mı?
    if (task.status === 'completed') {
      return NextResponse.json({ error: 'Bu görev zaten tamamlanmış' }, { status: 400 })
    }

    // Test çözümü için doğrulama (soru_cozumu tipinde)
    if (task.type === 'soru_cozumu' && task.testCount) {
      if (correctAnswers === undefined || wrongAnswers === undefined || blankAnswers === undefined) {
        return NextResponse.json({ 
          error: 'Test çözümü için doğru, yanlış ve boş sayıları gereklidir' 
        }, { status: 400 })
      }

      // Toplam kontrolü
      const total = correctAnswers + wrongAnswers + blankAnswers
      if (total !== task.testCount) {
        return NextResponse.json({ 
          error: `Toplam cevap sayısı (${total}) test sayısı (${task.testCount}) ile eşleşmiyor` 
        }, { status: 400 })
      }

      // Negatif değer kontrolü
      if (correctAnswers < 0 || wrongAnswers < 0 || blankAnswers < 0) {
        return NextResponse.json({ 
          error: 'Cevap sayıları negatif olamaz' 
        }, { status: 400 })
      }
    }

    // Puan hesaplama (4 yanlış = 1 doğru)
    let totalScore = null
    if (task.type === 'soru_cozumu' && correctAnswers !== undefined && wrongAnswers !== undefined) {
      // 4 yanlış = 1 doğru götürür
      const netCorrect = correctAnswers - Math.floor(wrongAnswers / 4)
      totalScore = Math.max(0, netCorrect) // Negatif olamaz
    }

    // Geç kalma kontrolü
    const now = new Date()
    const endDateTime = new Date(task.endDate)
    endDateTime.setHours(23, 59, 59, 999) // Gün sonuna ayarla
    
    const isOverdue = now > endDateTime
    const newStatus = isOverdue ? 'overdue' : 'completed'

    // Görevi güncelle
    const updatedTask = await prisma.task.update({
      where: {
        id: id
      },
      data: {
        status: newStatus,
        completedAt: now,
        completionNote: completionNote || null,
        correctAnswers: correctAnswers || null,
        wrongAnswers: wrongAnswers || null,
        blankAnswers: blankAnswers || null,
        totalScore: totalScore,
        testResult: null // Şimdilik kullanmıyoruz
      }
    })

    // Eğer soru çözümü ise TestResult oluştur
    if (task.type === 'soru_cozumu' && task.testCount) {
      await prisma.testResult.create({
        data: {
          studentId: user.id,
          taskId: id,
          score: totalScore || 0,
          totalQuestions: task.testCount,
          correctAnswers: correctAnswers || 0,
          wrongAnswers: wrongAnswers || 0,
          duration: null, // Şimdilik null
          status: 'completed',
          notes: completionNote || null,
          completedAt: now
        }
      })
    }

    // Eğer geç kaldıysa, öğrenciye ek süre talep etme seçeneği sun
    let canRequestExtension = false
    if (isOverdue) {
      // Daha önce ek süre talebi var mı kontrol et
      const existingExtension = await prisma.extensionRequest.findFirst({
        where: {
          taskId: id,
          studentId: user.id,
          status: 'pending'
        }
      })
      canRequestExtension = !existingExtension
    }

    return NextResponse.json({ 
      task: updatedTask,
      isOverdue,
      canRequestExtension,
      message: isOverdue 
        ? 'Görev geç kalınarak tamamlandı. Ek süre talep edebilirsiniz.' 
        : 'Görev başarıyla tamamlandı'
    })
  } catch (error) {
    console.error('Görev tamamlama hatası:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
