import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withAuth, withErrorHandling, validateRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Müfredat verileri - Her öğretmen oluşturulduğunda otomatik atanacak
const curriculumData = {
  "5": {
    "Matematik": [
      "Doğal Sayılar", "Kesirler", "Ondalık Gösterim", "Yüzdeler",
      "Geometri (Üçgenler, Dörtgenler, Çember)", "Alan ve Hacim", "Veri Toplama ve Grafikler"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları ve Noktalama",
      "Fiiller, İsimler, Sıfatlar, Zamirler", "Metin Türleri (Masal, Hikâye, Şiir)"
    ],
    "Fen Bilimleri": [
      "Canlılar Dünyası", "İnsan ve Çevre İlişkileri", "Maddenin Halleri ve Özellikleri",
      "Kuvvet ve Hareket", "Elektrik Devreleri", "Güneş, Dünya ve Ay"
    ],
    "Sosyal Bilgiler": [
      "Birey ve Toplum", "Ülkemizin Kaynakları", "Haklar ve Sorumluluklar",
      "İletişim ve Teknoloji", "Çevre ve Toplum"
    ],
    "İngilizce": [
      "Greetings and Introductions", "Family and Friends", "School Life",
      "Daily Routines", "Food and Drinks", "Hobbies and Interests"
    ]
  },
  "6": {
    "Matematik": [
      "Doğal Sayılarla İşlemler", "Kesirler ve Ondalık Sayılar", "Oran Orantı",
      "Cebirsel İfadeler", "Geometrik Cisimler", "Veri ve Olasılık"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Dil Bilgisi", "Metin Türleri"
    ],
    "Fen Bilimleri": [
      "Güneş Sistemi ve Tutulmalar", "Vücudumuzdaki Sistemler", "Kuvvet ve Hareket",
      "Madde ve Isı", "Ses ve Özellikleri", "Elektriğin İletimi"
    ],
    "Sosyal Bilgiler": [
      "Birey ve Toplum", "Kültür ve Miras", "İnsanlar, Yerler ve Çevreler",
      "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim"
    ],
    "İngilizce": [
      "Personal Information", "School and Education", "Hobbies and Free Time",
      "Food and Health", "Travel and Transportation", "Technology and Communication"
    ]
  },
  "7": {
    "Matematik": [
      "Tam Sayılarla İşlemler", "Rasyonel Sayılar", "Cebirsel İfadeler",
      "Eşitlik ve Denklem", "Oran ve Orantı", "Yüzdeler", "Doğrular ve Açılar",
      "Çokgenler", "Çember ve Daire", "Veri Analizi"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fen Bilimleri": [
      "Güneş Sistemi ve Ötesi", "Hücre ve Bölünmeler", "Kuvvet ve Enerji",
      "Madde ve Endüstri", "Canlılar ve Yaşam", "Elektrik Devreleri"
    ],
    "Sosyal Bilgiler": [
      "Birey ve Toplum", "Kültür ve Miras", "İnsanlar, Yerler ve Çevreler",
      "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim", "Etkin Vatandaşlık"
    ],
    "İngilizce": [
      "Personal Experiences", "School Life", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  },
  "8": {
    "Matematik": [
      "Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Veri Analizi",
      "Basit Eşitsizlikler", "Üçgenler", "Eşlik ve Benzerlik", "Dönüşüm Geometrisi",
      "Geometrik Cisimler", "Eşitsizlikler"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fen Bilimleri": [
      "Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri",
      "Basit Makineler", "Enerji Dönüşümleri", "Elektrik Yükleri ve Elektrik Enerjisi"
    ],
    "Sosyal Bilgiler": [
      "Birey ve Toplum", "Kültür ve Miras", "İnsanlar, Yerler ve Çevreler",
      "Bilim, Teknoloji ve Toplum", "Üretim, Dağıtım ve Tüketim", "Etkin Vatandaşlık"
    ],
    "İngilizce": [
      "Personal Experiences", "School and Education", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  },
  "9": {
    "Matematik": [
      "Mantık", "Kümeler", "Denklemler ve Eşitsizlikler", "Üçgenler",
      "Vektörler", "Veri", "Olasılık", "Fonksiyonlar", "İkinci Dereceden Denklemler"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fizik": [
      "Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet",
      "Enerji", "Isı ve Sıcaklık", "Elektrostatik", "Elektrik Akımı"
    ],
    "Kimya": [
      "Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler",
      "Maddenin Halleri", "Kimyasal Tepkimeler", "Asitler, Bazlar ve Tuzlar"
    ],
    "Biyoloji": [
      "Yaşam Bilimi Biyoloji", "Hücre ve Organizma", "Canlıların Çeşitliliği",
      "Hücresel Solunum", "Fotosentez", "Hücre Bölünmeleri"
    ],
    "Tarih": [
      "Tarih ve Zaman", "İnsanlığın İlk Dönemleri", "Orta Çağ'da Dünya",
      "İlk ve Orta Çağlarda Türk Dünyası", "İslam Medeniyetinin Doğuşu"
    ],
    "Coğrafya": [
      "Doğal Sistemler", "Beşeri Sistemler", "Mekânsal Sentez Türkiye",
      "Küresel Ortam: Bölgeler ve Ülkeler", "Çevre ve Toplum"
    ],
    "İngilizce": [
      "Personal Experiences", "School and Education", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  },
  "10": {
    "Matematik": [
      "Sıralama ve Seçme", "Basit Eşitsizlikler", "Mutlak Değer",
      "Üçgenler", "Dörtgenler ve Çokgenler", "Çember ve Daire", "Katı Cisimler"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fizik": [
      "Elektrik ve Manyetizma", "Dalgalar", "Optik", "Modern Fizik"
    ],
    "Kimya": [
      "Kimyasal Tepkimeler", "Karbon Kimyasına Giriş", "Hayatımızda Kimya"
    ],
    "Biyoloji": [
      "Ekosistem Ekolojisi", "Dünyamız", "Ekoloji", "Güncel Çevre Sorunları"
    ],
    "Tarih": [
      "Yerleşme ve Devletleşme", "Beylikten Devlete", "Dünya Gücü Osmanlı",
      "Arayış Yılları", "En Uzun Yüzyıl"
    ],
    "Coğrafya": [
      "Doğal Sistemler", "Beşeri Sistemler", "Mekânsal Sentez Türkiye",
      "Küresel Ortam: Bölgeler ve Ülkeler", "Çevre ve Toplum"
    ],
    "İngilizce": [
      "Personal Experiences", "School and Education", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  },
  "11": {
    "Matematik": [
      "Trigonometri", "Analitik Geometri", "Fonksiyonlarda Uygulamalar",
      "Denklem ve Eşitsizlik Sistemleri", "Çemberin Analitik İncelenmesi"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fizik": [
      "Elektrik ve Manyetizma", "Dalgalar", "Optik", "Modern Fizik"
    ],
    "Kimya": [
      "Kimyasal Tepkimeler", "Karbon Kimyasına Giriş", "Hayatımızda Kimya"
    ],
    "Biyoloji": [
      "Ekosistem Ekolojisi", "Dünyamız", "Ekoloji", "Güncel Çevre Sorunları"
    ],
    "Tarih": [
      "Yerleşme ve Devletleşme", "Beylikten Devlete", "Dünya Gücü Osmanlı",
      "Arayış Yılları", "En Uzun Yüzyıl"
    ],
    "Coğrafya": [
      "Doğal Sistemler", "Beşeri Sistemler", "Mekânsal Sentez Türkiye",
      "Küresel Ortam: Bölgeler ve Ülkeler", "Çevre ve Toplum"
    ],
    "İngilizce": [
      "Personal Experiences", "School and Education", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  },
  "12": {
    "Matematik": [
      "Üstel ve Logaritmik Fonksiyonlar", "Diziler", "Trigonometri",
      "Dönüşümler", "Türev", "İntegral"
    ],
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Yazım Kuralları",
      "Noktalama İşaretleri", "Dil Bilgisi", "Metin Türleri"
    ],
    "Fizik": [
      "Elektrik ve Manyetizma", "Dalgalar", "Optik", "Modern Fizik"
    ],
    "Kimya": [
      "Kimyasal Tepkimeler", "Karbon Kimyasına Giriş", "Hayatımızda Kimya"
    ],
    "Biyoloji": [
      "Ekosistem Ekolojisi", "Dünyamız", "Ekoloji", "Güncel Çevre Sorunları"
    ],
    "Tarih": [
      "Yerleşme ve Devletleşme", "Beylikten Devlete", "Dünya Gücü Osmanlı",
      "Arayış Yılları", "En Uzun Yüzyıl"
    ],
    "Coğrafya": [
      "Doğal Sistemler", "Beşeri Sistemler", "Mekânsal Sentez Türkiye",
      "Küresel Ortam: Bölgeler ve Ülkeler", "Çevre ve Toplum"
    ],
    "İngilizce": [
      "Personal Experiences", "School and Education", "Hobbies and Interests",
      "Health and Body", "Travel and Places", "Technology and Future"
    ]
  }
}

// Müfredat verilerini veritabanına ekleme fonksiyonu
async function seedCurriculum() {
  try {
    // Sınıfları oluştur
    for (const [grade, subjects] of Object.entries(curriculumData)) {
      const className = `${grade}. Sınıf`
      
      // Sınıf var mı kontrol et
      let classRecord = await prisma.class.findFirst({
        where: { name: className }
      })
      
      if (!classRecord) {
        classRecord = await prisma.class.create({
          data: { 
            name: className,
            level: parseInt(grade)
          }
        })
        console.log(`✅ Sınıf oluşturuldu: ${className} (Level: ${parseInt(grade)})`)
      }
      
      // Dersleri oluştur
      for (const [subjectName, topics] of Object.entries(subjects)) {
        // Ders var mı kontrol et
        let subjectRecord = await prisma.subject.findFirst({
          where: { 
            name: subjectName,
            classId: classRecord.id
          }
        })
        
        if (!subjectRecord) {
          subjectRecord = await prisma.subject.create({
            data: {
              name: subjectName,
              classId: classRecord.id
            }
          })
        }
        
        // Konuları oluştur
        for (const topicName of topics) {
          const topicExists = await prisma.topic.findFirst({
            where: {
              name: topicName,
              subjectId: subjectRecord.id
            }
          })
          
          if (!topicExists) {
            await prisma.topic.create({
              data: {
                name: topicName,
                subjectId: subjectRecord.id
              }
            })
          }
        }
      }
    }
    
    console.log('✅ Müfredat verileri başarıyla eklendi')
  } catch (error) {
    console.error('❌ Müfredat verileri eklenirken hata:', error)
  }
}

interface CreateTeacherRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  department?: string
  specialization?: string[]
  hireDate: string
  salary?: number
}

export const GET = withAuth(
  withErrorHandling(async (req) => {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return createSuccessResponse(teachers)
  })
)

export const POST = withAuth(
  withErrorHandling(async (req) => {
    const body = await req.json()
    const {
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      department,
      specialization,
      hireDate,
      salary
    } = validateRequestBody<CreateTeacherRequest>(body, [
      'email', 'password', 'firstName', 'lastName', 'hireDate'
    ])

    // Generate employee ID
    const generatedEmployeeId = `EMP${Date.now()}`

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create teacher user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: UserRole.TEACHER,
          status: 'ACTIVE'
        }
      })

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: generatedEmployeeId,
          department: department || 'Genel',
          specialization: JSON.stringify(specialization || []),
          hireDate: new Date(hireDate),
          salary: salary ? new Decimal(salary) : null
        }
      })

      return { user, teacher }
    })

    // Müfredat verilerini otomatik ekle
    await seedCurriculum()

    // Return success response
    return createSuccessResponse({
      message: 'Öğretmen başarıyla oluşturuldu',
      teacher: {
        id: result.teacher.id,
        employeeId: result.teacher.employeeId,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          phone: result.user.phone
        }
      }
    })
  })
)
