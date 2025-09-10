import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedTestData() {
  console.log('🌱 Test verileri ekleniyor...')

  // Create test teacher
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const teacher = await prisma.teacher.upsert({
    where: { employeeId: 'T001' },
    update: {},
    create: {
      employeeId: 'T001',
      specialization: 'Matematik',
      hireDate: new Date('2020-09-01'),
      user: {
        create: {
          email: 'teacher@test.com',
          password: hashedPassword,
          firstName: 'Ahmet',
          lastName: 'Öğretmen',
          role: 'TEACHER'
        }
      }
    },
    include: { user: true }
  })

  // Create test students
  const student1 = await prisma.student.create({
    data: {
      teacher: {
        connect: { id: teacher.id }
      },
      user: {
        create: {
          email: 'student1@test.com',
          password: hashedPassword,
          firstName: 'Ali',
          lastName: 'Öğrenci',
          role: 'STUDENT'
        }
      },
      registrationDate: new Date(),
      grade: '9. Sınıf',
      city: 'İstanbul'
    },
    include: { user: true }
  })

  const student2 = await prisma.student.create({
    data: {
      teacher: {
        connect: { id: teacher.id }
      },
      user: {
        create: {
          email: 'student2@test.com',
          password: hashedPassword,
          firstName: 'Ayşe',
          lastName: 'Öğrenci',
          role: 'STUDENT'
        }
      },
      registrationDate: new Date(),
      grade: '10. Sınıf',
      city: 'Ankara'
    },
    include: { user: true }
  })

  const students = [student1, student2]

  // Create test class and subject
  const testClass = await prisma.class.upsert({
    where: { name: 'Test Sınıfı' },
    update: {},
    create: {
      name: 'Test Sınıfı',
      level: 9,
      description: 'Test için oluşturulan sınıf'
    }
  })

  const mathSubject = await prisma.subject.upsert({
    where: { 
      name_classId: {
        name: 'Matematik',
        classId: testClass.id
      }
    },
    update: {},
    create: {
      name: 'Matematik',
      classId: testClass.id,
      description: 'Matematik dersi'
    }
  })

  // Create test tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        studentId: students[0].id,
        teacherId: teacher.id,
        subjectId: mathSubject.id,
        description: 'Matematik Testi - Cebir',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'soru_cozumu',
        resourceName: 'Matematik Test Kitabı',
        testCount: 20,
        status: 'completed',
        completedAt: new Date(),
        completionNote: 'Test başarıyla tamamlandı',
        correctAnswers: 18,
        wrongAnswers: 2,
        blankAnswers: 0,
        totalScore: 16.0
      }
    }),
    prisma.task.create({
      data: {
        studentId: students[1].id,
        teacherId: teacher.id,
        subjectId: mathSubject.id,
        description: 'Matematik Testi - Geometri',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'soru_cozumu',
        resourceName: 'Geometri Test Kitabı',
        testCount: 15,
        status: 'completed',
        completedAt: new Date(),
        completionNote: 'Test tamamlandı',
        correctAnswers: 12,
        wrongAnswers: 3,
        blankAnswers: 0,
        totalScore: 9.0
      }
    })
  ])

  // Create test results
  await Promise.all([
    prisma.testResult.create({
      data: {
        studentId: students[0].id,
        taskId: tasks[0].id,
        score: 18,
        totalQuestions: 20,
        correctAnswers: 18,
        wrongAnswers: 2,
        duration: 45,
        status: 'completed',
        notes: 'Çok iyi performans',
        completedAt: new Date()
      }
    }),
    prisma.testResult.create({
      data: {
        studentId: students[1].id,
        taskId: tasks[1].id,
        score: 12,
        totalQuestions: 15,
        correctAnswers: 12,
        wrongAnswers: 3,
        duration: 38,
        status: 'completed',
        notes: 'İyi performans',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    }),
    prisma.testResult.create({
      data: {
        studentId: students[0].id,
        taskId: tasks[1].id,
        score: 8,
        totalQuestions: 15,
        correctAnswers: 8,
        wrongAnswers: 5,
        duration: 30,
        status: 'failed',
        notes: 'Yeniden çalışılmalı',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    })
  ])

  console.log('✅ Test verileri başarıyla eklendi!')
  console.log(`👨‍🏫 Öğretmen: ${teacher.user.firstName} ${teacher.user.lastName}`)
  console.log(`👨‍🎓 Öğrenciler: ${students.length} adet`)
  console.log(`📚 Test Sonuçları: 3 adet`)
}

seedTestData()
  .catch((e) => {
    console.error('❌ Test verileri eklenirken hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
