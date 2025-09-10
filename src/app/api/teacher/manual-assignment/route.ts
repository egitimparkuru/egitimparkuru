import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Token'ı çıkar ve doğrula
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

    const body = await request.json()
    const { studentId, className, subjectName, topics } = body

    // Gerekli alanları kontrol et
    if (!studentId || !className || !subjectName || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      )
    }

    // Öğrencinin bu öğretmene ait olduğunu kontrol et
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: teacher.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Transaction ile tüm işlemleri yap
    const result = await prisma.$transaction(async (tx) => {
      // Önce sınıfı oluştur veya bul
      let classRecord = await tx.class.findUnique({
        where: { name: className }
      })

      if (!classRecord) {
        // Sınıf yoksa oluştur (level'ı className'den çıkar)
        const level = parseInt(className.replace(/\D/g, '')) || 99 // Sayı yoksa 99 (özel sınıf)
        classRecord = await tx.class.create({
          data: {
            name: className,
            level: level
          }
        })
      }

      // Dersi oluştur veya bul
      let subjectRecord = await tx.subject.findUnique({
        where: {
          name_classId: {
            name: subjectName,
            classId: classRecord.id
          }
        }
      })

      if (!subjectRecord) {
        // Ders yoksa oluştur
        subjectRecord = await tx.subject.create({
          data: {
            name: subjectName,
            classId: classRecord.id
          }
        })
      }

      // Konuları oluştur
      const topicRecords = await Promise.all(
        topics.map((topicName: string) => 
          tx.topic.upsert({
            where: {
              name_subjectId: {
                name: topicName,
                subjectId: subjectRecord.id
              }
            },
            update: {},
            create: {
              name: topicName,
              subjectId: subjectRecord.id
            }
          })
        )
      )

      // Ders atamasını oluştur
      const assignment = await tx.studentSubject.upsert({
        where: {
          studentId_subjectId: {
            studentId,
            subjectId: subjectRecord.id
          }
        },
        update: {},
        create: {
          studentId,
          subjectId: subjectRecord.id,
          status: 'assigned'
        }
      })

      // Tüm konular için progress kayıtları oluştur
      const progressRecords = await Promise.all(
        topicRecords.map(topic => 
          tx.studentProgress.upsert({
            where: {
              studentId_topicId: {
                studentId,
                topicId: topic.id
              }
            },
            update: {},
            create: {
              studentId,
              topicId: topic.id,
              status: 'pending'
            }
          })
        )
      )

      return {
        assignment,
        classRecord,
        subjectRecord,
        topicRecords,
        progressRecords
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Manuel ders başarıyla atandı'
    })

  } catch (error) {
    console.error('Manual assignment error:', error)
    return NextResponse.json(
      { error: 'Manuel ders atanırken hata oluştu' },
      { status: 500 }
    )
  }
}
