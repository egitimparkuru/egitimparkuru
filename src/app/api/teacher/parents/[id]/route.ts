import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAuth, withErrorHandling, validateRequestBody } from '@/lib/middleware'

const prisma = new PrismaClient()

// GET - Tek veli getir
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

  const parent = await prisma.parent.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true,
      student: {
        include: {
          user: true
        }
      }
    }
  })

  if (!parent) {
    return NextResponse.json({
      success: false,
      error: 'Veli bulunamadı'
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: parent
  })
})

// PUT - Veli güncelle
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

  const { firstName, lastName, email, password, occupation, studentId, notes } = body

  // Check if parent exists and belongs to teacher
  const existingParent = await prisma.parent.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!existingParent) {
    return NextResponse.json({
      success: false,
      error: 'Veli bulunamadı'
    }, { status: 404 })
  }

  // Check if email is already used by another user
  const emailUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: existingParent.userId }
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
      const { hashPassword } = await import('@/lib/auth')
      userUpdateData.password = await hashPassword(password)
    }

    await prisma.user.update({
      where: { id: existingParent.userId },
      data: userUpdateData
    })

    // Update parent
    const updatedParent = await prisma.parent.update({
      where: { id: params.id },
      data: {
        studentId: studentId || null,
        occupation: occupation || null,
        notes: notes || null
      },
      include: {
        user: true,
        student: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedParent,
      message: 'Veli başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Parent update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Veli güncellenirken bir hata oluştu'
    }, { status: 500 })
  }
})

// DELETE - Veli sil
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
  
  // Check if parent exists and belongs to teacher
  const existingParent = await prisma.parent.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true,
      student: true
    }
  })

  if (!existingParent) {
    return NextResponse.json({
      success: false,
      error: 'Veli bulunamadı'
    }, { status: 404 })
  }

  // Check if parent has a student assigned
  if (existingParent.student) {
    return NextResponse.json({
      success: false,
      error: 'Bu velinin bir öğrencisi var. Önce öğrenci atamasını kaldırın.'
    }, { status: 400 })
  }

  try {
    // Delete parent (this will cascade to related records)
    await prisma.parent.delete({
      where: { id: params.id }
    })

    // Delete user
    await prisma.user.delete({
      where: { id: existingParent.userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Veli başarıyla silindi'
    })
  } catch (error) {
    console.error('Parent deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Veli silinirken bir hata oluştu'
    }, { status: 500 })
  }
})

// PATCH - Veli durumunu değiştir (aktif/pasif)
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

  // Check if parent exists and belongs to teacher
  const existingParent = await prisma.parent.findFirst({
    where: {
      id: id,
      teacherId: teacher.id
    },
    include: {
      user: true
    }
  })

  if (!existingParent) {
    return NextResponse.json({
      success: false,
      error: 'Veli bulunamadı'
    }, { status: 404 })
  }

  try {
    // Update user status
    await prisma.user.update({
      where: { id: existingParent.userId },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: `Veli ${status === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı`
    })
  } catch (error) {
    console.error('Parent status update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Veli durumu güncellenirken bir hata oluştu'
    }, { status: 500 })
  }
})
