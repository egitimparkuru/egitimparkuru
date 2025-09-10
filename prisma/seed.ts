import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Müfredat verileri
const curriculumData = {
  "5": {
    "Matematik": [
      "Doğal Sayılar",
      "Kesirler", 
      "Ondalık Gösterim",
      "Yüzdeler",
      "Geometri (Üçgenler, Dörtgenler, Çember)",
      "Alan ve Hacim",
      "Veri Toplama ve Grafikler"
    ],
    "Türkçe": [
      "Sözcükte Anlam",
      "Cümlede Anlam", 
      "Paragraf",
      "Yazım Kuralları ve Noktalama",
      "Fiiller, İsimler, Sıfatlar, Zamirler",
      "Metin Türleri (Masal, Hikâye, Şiir)"
    ],
    "Fen Bilimleri": [
      "Canlılar Dünyası",
      "İnsan ve Çevre İlişkileri",
      "Maddenin Halleri ve Özellikleri",
      "Kuvvet ve Hareket",
      "Elektrik Devreleri",
      "Güneş, Dünya ve Ay"
    ],
    "Sosyal Bilgiler": [
      "Birey ve Toplum",
      "Ülkemizin Kaynakları",
      "Haklar ve Sorumluluklar",
      "İletişim ve Teknoloji",
      "Çevre ve Toplum"
    ]
  },
  "6": {
    "Matematik": [
      "Doğal Sayılarla İşlemler",
      "Kesirler ve Ondalık Sayılar",
      "Oran Orantı",
      "Cebirsel İfadeler",
      "Geometrik Cisimler",
      "Veri ve Olasılık"
    ],
    "Türkçe": [
      "Anlam Bilgisi",
      "Paragraf Yorumu",
      "Sözcük Türleri",
      "Yazım-Noktalama",
      "Anlatım Türleri"
    ],
    "Fen Bilimleri": [
      "Vücudumuzdaki Sistemler",
      "Kuvvet ve Hareket",
      "Işık ve Ses",
      "Maddenin Tanecikli Yapısı",
      "Elektrik",
      "Canlılarda Üreme"
    ],
    "Sosyal Bilgiler": [
      "Tarih Bilimi",
      "İpek Yolu ve Ticaret",
      "Anadolu'nun Türkleşmesi",
      "Demokrasi Kavramı",
      "Doğa ve İnsan"
    ]
  },
  "7": {
    "Matematik": [
      "Tam Sayılar",
      "Oran Orantı",
      "Cebirsel İfadeler",
      "Eşitsizlikler",
      "Çokgenler",
      "Dönüşüm Geometrisi",
      "Olasılık"
    ],
    "Türkçe": [
      "Paragraf Yorumu",
      "Anlatım Bozuklukları",
      "Yazım-Noktalama",
      "Edebi Türler (Tiyatro, Roman, Hikâye)"
    ],
    "Fen Bilimleri": [
      "Hücre ve Organizma",
      "Kuvvet ve Enerji",
      "Saf Maddeler ve Karışımlar",
      "Işığın Yansıması ve Kırılması",
      "Elektrik ve Manyetizma",
      "İnsan ve Çevre"
    ],
    "Sosyal Bilgiler": [
      "Osmanlı Devleti'nin Kuruluşu",
      "Dünya Gücü Osmanlı",
      "Rönesans ve Reform",
      "Coğrafi Keşifler",
      "Demokrasi Kültürü"
    ]
  },
  "8": {
    "Matematik": [
      "Çarpanlar ve Katlar",
      "Üslü İfadeler",
      "Kareköklü İfadeler",
      "Cebirsel İfadeler ve Denklemler",
      "Doğrusal Denklemler",
      "Geometri (Üçgenler, Çember, Katı Cisimler)",
      "Olasılık ve İstatistik"
    ],
    "Türkçe": [
      "Sözcükte Anlam",
      "Cümlede Anlam",
      "Paragraf Yorumu",
      "Yazım Kuralları ve Noktalama",
      "Sözel Mantık ve Akıl Yürütme"
    ],
    "Fen Bilimleri": [
      "DNA ve Genetik Kod",
      "Basınç",
      "Madde ve Endüstri",
      "Basit Makineler",
      "Elektrik Yükleri ve Devreler",
      "Işık ve Ses"
    ],
    "T.C. İnkılap Tarihi ve Atatürkçülük": [
      "Bir Kahraman Doğuyor (Mustafa Kemal)",
      "Milli Mücadele Dönemi",
      "Cumhuriyetin İlanı",
      "Atatürk İlkeleri ve İnkılapları",
      "Çağdaş Türkiye"
    ],
    "Din Kültürü": [
      "Kuran-ı Kerim ve Yorumları",
      "Hz. Muhammed'in Hayatı",
      "İnanç ve İbadet",
      "Ahlak ve Değerler"
    ],
    "İngilizce": [
      "Günlük Hayat",
      "Seyahat ve Tatil",
      "Teknoloji",
      "Kültürlerarası İletişim",
      "Gelecek Planları"
    ]
  },
  "9": {
    "Matematik": [
      "Sayılar",
      "Rasyonel Sayılar",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Çarpanlara Ayırma",
      "Denklem ve Eşitsizlikler",
      "Fonksiyonlar",
      "Temel Geometri (Doğru, Açı, Üçgen)"
    ],
    "Türk Dili ve Edebiyatı": [
      "Dil Bilgisi Temelleri",
      "Cümle Bilgisi",
      "Anlam Bilgisi",
      "Paragraf Yorumu",
      "Şiir (Nazım Birimi, Ölçü, Kafiye)",
      "Roman, Hikâye, Masal"
    ],
    "Fizik": [
      "Fizik Bilimine Giriş",
      "Madde ve Özellikleri",
      "Kuvvet ve Hareket",
      "Enerji",
      "Isı ve Sıcaklık"
    ],
    "Kimya": [
      "Kimya Bilimi",
      "Atom ve Periyodik Sistem",
      "Kimyasal Bağlar",
      "Maddenin Halleri",
      "Karışımlar"
    ],
    "Biyoloji": [
      "Canlıların Yapı Taşları",
      "Hücre ve Organelleri",
      "Hücre Bölünmeleri (Mitoz, Mayoz)",
      "Canlıların Sınıflandırılması",
      "Ekosistem"
    ],
    "Coğrafya": [
      "Doğa ve İnsan",
      "Harita Bilgisi",
      "Atmosfer ve İklim",
      "Yeryüzü Şekilleri",
      "Nüfus ve Yerleşme"
    ],
    "Tarih": [
      "Tarih Bilimine Giriş",
      "İlk Çağ Medeniyetleri",
      "Türklerin Orta Asya Tarihi",
      "İslamiyet'in Doğuşu ve İlk Dönemler",
      "İlk Türk-İslam Devletleri"
    ],
    "Felsefe": [
      "Felsefeye Giriş",
      "Bilgi Felsefesi"
    ]
  },
  "10": {
    "Matematik": [
      "Polinomlar",
      "İkinci Dereceden Denklemler",
      "Eşitsizlikler",
      "Fonksiyonlar ve Grafikler",
      "Çember ve Daire",
      "Katı Cisimler"
    ],
    "Edebiyat": [
      "İslamiyet Öncesi Türk Edebiyatı",
      "Halk Edebiyatı",
      "Divan Edebiyatı Temelleri",
      "Metin Yorumu"
    ],
    "Fizik": [
      "Basınç ve Kaldırma Kuvveti",
      "Dalgalar",
      "Elektrik ve Manyetizma",
      "Optik"
    ],
    "Kimya": [
      "Kimyasal Hesaplamalar",
      "Asitler ve Bazlar",
      "Kimyasal Tepkimeler",
      "Periyodik Sistem Gelişimi"
    ],
    "Biyoloji": [
      "Hücre Zarından Madde Geçişi",
      "Fotosentez",
      "Solunum",
      "Bitki Biyolojisi",
      "Canlılarda Üreme"
    ],
    "Coğrafya": [
      "İklim Tipleri",
      "Yer kabuğu ve İç Kuvvetler",
      "Dış Kuvvetler",
      "Türkiye'nin Yer Şekilleri"
    ],
    "Tarih": [
      "Osmanlı Devleti'nin Kuruluşu",
      "Yükselme Dönemi",
      "Avrupa'daki Gelişmeler"
    ],
    "Felsefe": [
      "Varlık Felsefesi",
      "Ahlak Felsefesi"
    ]
  },
  "11": {
    "Matematik": [
      "Trigonometri",
      "Logaritma",
      "Diziler",
      "Limit",
      "Analitik Geometri",
      "Olasılık"
    ],
    "Edebiyat": [
      "Tanzimat Edebiyatı",
      "Servet-i Fünun",
      "Fecr-i Ati",
      "Milli Edebiyat",
      "Cumhuriyet Dönemi Şiir"
    ],
    "Fizik": [
      "Elektrik Alan ve Potansiyel",
      "Mıknatıslar",
      "Modern Fizik",
      "Dalgalar ve Optik"
    ],
    "Kimya": [
      "Organik Kimya Başlangıç",
      "Elektrokimya",
      "Kimya ve Enerji"
    ],
    "Biyoloji": [
      "Kalıtım",
      "DNA ve Genetik Kod",
      "Evrim",
      "İnsan Fizyolojisi"
    ],
    "Coğrafya": [
      "Türkiye'nin İklim ve Bitki Örtüsü",
      "Türkiye'nin Yeraltı ve Yerüstü Kaynakları",
      "Nüfus ve Göç"
    ],
    "Tarih": [
      "Osmanlı Duraklama ve Gerileme",
      "Islahatlar",
      "Fransız İhtilali",
      "Sanayi Devrimi"
    ],
    "Felsefe": [
      "Sanat Felsefesi",
      "Din Felsefesi",
      "Siyaset Felsefesi"
    ]
  },
  "12": {
    "Matematik": [
      "Limit, Türev, İntegral",
      "İleri Olasılık",
      "İleri Fonksiyonlar",
      "Analitik Geometri (Karmaşık)"
    ],
    "Edebiyat": [
      "Cumhuriyet Dönemi Türk Edebiyatı (Roman, Hikâye, Şiir)",
      "Türk Dünyası Edebiyatı",
      "Dünya Edebiyatı"
    ],
    "Fizik": [
      "Kuantum",
      "Fotoelektrik Olayı",
      "Atom Modelleri",
      "Çekirdek Fiziği"
    ],
    "Kimya": [
      "Organik Kimya (Detaylı)",
      "Polimerler",
      "Kimya ve Çevre",
      "Endüstride Kimya"
    ],
    "Biyoloji": [
      "Sinir Sistemi",
      "Endokrin Sistem",
      "İmmünoloji",
      "İnsan Genetiği",
      "Canlılar ve Çevre"
    ],
    "Coğrafya": [
      "Ekonomi ve Kalkınma",
      "Küreselleşme",
      "Çevre Sorunları",
      "Türkiye'nin Jeopolitik Konumu"
    ],
    "Tarih": [
      "Kurtuluş Savaşı",
      "Atatürk İlke ve İnkılapları",
      "Çağdaş Türk ve Dünya Tarihi"
    ],
    "Felsefe": [
      "Bilim Felsefesi",
      "Mantık",
      "Çağdaş Felsefe"
    ]
  }
}

async function main() {
  console.log('🌱 Müfredat verileri yükleniyor...')

  // Sınıfları oluştur
  for (const [className, subjects] of Object.entries(curriculumData)) {
    const classLevel = parseInt(className)
    
    const classRecord = await prisma.class.upsert({
      where: { level: classLevel },
      update: {},
      create: {
        name: className,
        level: classLevel
      }
    })

    console.log(`✅ ${className}. Sınıf oluşturuldu`)

    // Dersleri oluştur
    for (const [subjectName, topics] of Object.entries(subjects)) {
      const subjectRecord = await prisma.subject.upsert({
        where: { 
          name_classId: {
            name: subjectName,
            classId: classRecord.id
          }
        },
        update: {},
        create: {
          name: subjectName,
          classId: classRecord.id
        }
      })

      console.log(`  📚 ${subjectName} dersi oluşturuldu`)

      // Konuları oluştur
      for (const topicName of topics) {
        await prisma.topic.upsert({
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
      }

      console.log(`    📝 ${topics.length} konu eklendi`)
    }
  }

  console.log('🎉 Müfredat verileri başarıyla yüklendi!')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
