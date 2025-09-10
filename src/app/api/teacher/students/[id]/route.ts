import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAuth, withErrorHandling, validateRequestBody } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Tek öğrenci getir
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Manuel token extraction
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // URL'den id'yi çıkar
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]
  
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

  const student = await prisma.student.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!student) {
    return NextResponse.json({
      success: false,
      error: 'Öğrenci bulunamadı'
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: student
  })
})

// PUT - Öğrenci güncelle
export const PUT = withErrorHandling(async (request: NextRequest) => {
  // Manuel token extraction
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // URL'den id'yi çıkar
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]
  
  const body = await request.json()
  
  // Validation
  const requiredFields = ['firstName', 'lastName', 'email']
  const validation = validateRequestBody(body, requiredFields)
  if (!validation.isValid) {
    return NextResponse.json({
      success: false,
      error: validation.error
    }, { status: 400 })
  }

  const { firstName, lastName, email, password, registrationDate, grade, city, notes } = body

  // Check if student exists and belongs to teacher
  const existingStudent = await prisma.student.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!existingStudent) {
    return NextResponse.json({
      success: false,
      error: 'Öğrenci bulunamadı'
    }, { status: 404 })
  }

  // Check if email is already used by another user
  const emailUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: existingStudent.userId }
    }
  })

  if (emailUser) {
    return NextResponse.json({
      success: false,
      error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor'
    }, { status: 400 })
  }

  try {
    // Update user
    const userUpdateData: any = {
      firstName,
      lastName,
      email
    }
    
    // Only update password if provided
    if (password) {
      userUpdateData.password = await hashPassword(password)
    }
    
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: userUpdateData
    })

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        registrationDate: registrationDate ? new Date(registrationDate) : null,
        grade: grade || null,
        city: city || null,
        notes: notes || null
      },
      include: {
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'Öğrenci başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Student update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Öğrenci güncellenirken bir hata oluştu'
    }, { status: 500 })
  }
})

// DELETE - Öğrenci sil
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  // Manuel token extraction
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // URL'den id'yi çıkar
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]
  
  // Check if student exists and belongs to teacher
  const existingStudent = await prisma.student.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!existingStudent) {
    return NextResponse.json({
      success: false,
      error: 'Öğrenci bulunamadı'
    }, { status: 404 })
  }

  try {
    // Delete student (this will cascade to related records)
    await prisma.student.delete({
      where: { id: params.id }
    })

    // Delete user
    await prisma.user.delete({
      where: { id: existingStudent.userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Öğrenci başarıyla silindi'
    })
  } catch (error) {
    console.error('Student deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Öğrenci silinirken bir hata oluştu'
    }, { status: 500 })
  }
})

// PATCH - Öğrenci durumunu değiştir (aktif/pasif)
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  // Manuel token extraction
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  
  const { verifyToken } = await import('@/lib/auth')
  const payload = verifyToken(token)
  
  // URL'den id'yi çıkar
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1]
  
  const body = await request.json()
  const { status } = body

  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return NextResponse.json({
      success: false,
      error: 'Geçersiz durum değeri'
    }, { status: 400 })
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

  // Check if student exists and belongs to teacher
  const existingStudent = await prisma.student.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!existingStudent) {
    return NextResponse.json({
      success: false,
      error: 'Öğrenci bulunamadı'
    }, { status: 404 })
  }

  try {
    console.log('Updating student status:', {
      studentId: id,
      userId: existingStudent.userId,
      newStatus: status
    })
    
    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: existingStudent.userId },
      data: { status }
    })
    
    console.log('Student status updated successfully:', {
      userId: updatedUser.id,
      newStatus: updatedUser.status
    })

    return NextResponse.json({
      success: true,
      message: `Öğrenci ${status === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı`
    })
  } catch (error) {
    console.error('Student status update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Öğrenci durumu güncellenirken bir hata oluştu'
    }, { status: 500 })
  }
})
