'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Menu,
  X,
  LogOut,
  BookOpen,
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  MessageSquare,
  ClipboardList,
  HelpCircle,
  UserCheck,
  Settings,
  CheckSquare,
  Award,
  Clock,
  MessageCircle,
  TrendingUp,
  Wrench,
  User
} from 'lucide-react'

interface TeacherLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  showStudentSelector?: boolean
  selectedStudent?: string
  onStudentChange?: (studentId: string) => void
  students?: any[]
}

const getPageHeaderCard = (title: string, description?: string) => {
  const pageConfigs = {
    'Ana Sayfa': {
      icon: BarChart3,
      gradient: 'from-blue-50 to-indigo-100',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-500',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      descColor: 'text-blue-600',
      emoji: '🏠',
      features: ['Öğrenci istatistikleri', 'Görev takibi', 'Hızlı erişim']
    },
    'Öğrenci ve Veli Yönetimi': {
      icon: Users,
      gradient: 'from-emerald-50 to-green-100',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      descColor: 'text-emerald-600',
      emoji: '👥',
      features: ['Öğrenci ekleme/düzenleme', 'Veli yönetimi', 'Hesap durumu kontrolü']
    },
    'Dersler': {
      icon: BookOpen,
      gradient: 'from-purple-50 to-violet-100',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-500',
      iconColor: 'text-purple-600',
      titleColor: 'text-purple-900',
      descColor: 'text-purple-600',
      emoji: '📚',
      features: ['Ders atama', 'Konu takibi', 'İlerleme yönetimi']
    },
    'Görevler': {
      icon: CheckSquare,
      gradient: 'from-orange-50 to-amber-100',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-500',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      descColor: 'text-orange-600',
      emoji: '📝',
      features: ['Görev oluşturma', 'Süre takibi', 'Durum yönetimi']
    },
    'Rutin Görevler': {
      icon: Clock,
      gradient: 'from-indigo-50 to-purple-100',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-500',
      iconColor: 'text-indigo-600',
      titleColor: 'text-indigo-900',
      descColor: 'text-indigo-600',
      emoji: '🔄',
      features: ['Görev şablonları', 'Haftalık planlama', 'Manuel kontrol']
    },
    'Test Merkezi': {
      icon: BookOpen,
      gradient: 'from-emerald-50 to-teal-100',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      descColor: 'text-emerald-600',
      emoji: '📊',
      features: ['Test sonuçları', 'Performans analizi', 'Öğrenci takibi']
    },
    'Deneme Merkezi': {
      icon: Award,
      gradient: 'from-rose-50 to-pink-100',
      borderColor: 'border-rose-200',
      iconBg: 'bg-rose-500',
      iconColor: 'text-rose-600',
      titleColor: 'text-rose-900',
      descColor: 'text-rose-600',
      emoji: '🏆',
      features: ['Sınav oluşturma', 'Sonuç analizi', 'Performans takibi']
    },
    'Takvim': {
      icon: Calendar,
      gradient: 'from-cyan-50 to-blue-100',
      borderColor: 'border-cyan-200',
      iconBg: 'bg-cyan-500',
      iconColor: 'text-cyan-600',
      titleColor: 'text-cyan-900',
      descColor: 'text-cyan-600',
      emoji: '📅',
      features: ['Etkinlik planlama', 'Tarih yönetimi', 'Hatırlatıcılar']
    },
    'Gelen Sorular': {
      icon: FileText,
      gradient: 'from-indigo-50 to-blue-100',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-500',
      iconColor: 'text-indigo-600',
      titleColor: 'text-indigo-900',
      descColor: 'text-indigo-600',
      emoji: '❓',
      features: ['Soru yanıtlama', 'Kategori yönetimi', 'Öncelik sıralama']
    },
    'Mesajlaşma': {
      icon: MessageCircle,
      gradient: 'from-teal-50 to-emerald-100',
      borderColor: 'border-teal-200',
      iconBg: 'bg-teal-500',
      iconColor: 'text-teal-600',
      titleColor: 'text-teal-900',
      descColor: 'text-teal-600',
      emoji: '💬',
      features: ['Anlık mesajlaşma', 'Grup konuşmaları', 'Dosya paylaşımı']
    },
    'Raporlar': {
      icon: TrendingUp,
      gradient: 'from-yellow-50 to-orange-100',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-500',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      descColor: 'text-yellow-600',
      emoji: '📊',
      features: ['Performans raporları', 'İstatistik analizi', 'Grafik görünümleri']
    },
    'Teknik Destek': {
      icon: HelpCircle,
      gradient: 'from-gray-50 to-slate-100',
      borderColor: 'border-gray-200',
      iconBg: 'bg-gray-500',
      iconColor: 'text-gray-600',
      titleColor: 'text-gray-900',
      descColor: 'text-gray-600',
      emoji: '🛠️',
      features: ['Yardım merkezi', 'Teknik sorunlar', 'İletişim desteği']
    },
    'Profil': {
      icon: User,
      gradient: 'from-violet-50 to-purple-100',
      borderColor: 'border-violet-200',
      iconBg: 'bg-violet-500',
      iconColor: 'text-violet-600',
      titleColor: 'text-violet-900',
      descColor: 'text-violet-600',
      emoji: '👤',
      features: ['Kişisel bilgiler', 'Profil fotoğrafı', 'Hesap ayarları']
    },
    'Ayarlar': {
      icon: Settings,
      gradient: 'from-slate-50 to-gray-100',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-500',
      iconColor: 'text-slate-600',
      titleColor: 'text-slate-900',
      descColor: 'text-slate-600',
      emoji: '⚙️',
      features: ['Sistem ayarları', 'Bildirim tercihleri', 'Güvenlik ayarları']
    }
  }

  const config = pageConfigs[title as keyof typeof pageConfigs] || {
    icon: BookOpen,
    gradient: 'from-blue-50 to-indigo-100',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-500',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    descColor: 'text-blue-600',
    emoji: '📄',
    features: ['Sayfa özellikleri', 'Yönetim araçları', 'Hızlı erişim']
  }

  return (
    <Card className={`bg-gradient-to-r ${config.gradient} ${config.borderColor} border-2 shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`h-16 w-16 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-3xl">{config.emoji}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className={`text-3xl font-bold ${config.titleColor}`}>
                {title}
              </h1>
              <div className={`h-8 w-8 ${config.iconBg} rounded-lg flex items-center justify-center`}>
                <config.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className={`text-lg ${config.descColor} mb-4`}>
              {description || 'Bu sayfada ilgili işlemlerinizi gerçekleştirebilirsiniz.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {config.features.map((feature, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.iconColor} bg-white/50`}
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeacherLayout({
  children,
  title,
  description,
  showStudentSelector = false,
  selectedStudent = '',
  onStudentChange,
  students = []
}: TeacherLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Ana Sayfa', href: 'overview', icon: BarChart3 },
    { name: 'Öğrenci ve Veli Yönetimi', href: 'students', icon: Users },
    { name: 'Dersler', href: 'lessons', icon: BookOpen },
    { name: 'Görevler', href: 'tasks', icon: CheckSquare },
    { name: 'Rutin Görevler', href: 'routine-tasks', icon: Clock },
    { name: 'Test Merkezi', href: 'test-center', icon: BookOpen },
    { name: 'Deneme Merkezi', href: 'exams', icon: Award },
    { name: 'Takvim', href: 'calendar', icon: Calendar },
    { name: 'Gelen Sorular', href: 'questions', icon: FileText },
    { name: 'Mesajlaşma', href: 'messages', icon: MessageCircle },
    { name: 'Raporlar', href: 'reports', icon: TrendingUp },
    { name: 'Teknik Destek', href: 'support', icon: HelpCircle },
    { name: 'Profil', href: 'profile', icon: User },
    { name: 'Ayarlar', href: 'settings', icon: Settings },
  ]

  const isActivePage = (href: string) => {
    if (href === 'overview') {
      return pathname === '/teacher/dashboard'
    }
    return pathname === `/teacher/${href}`
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-lg font-semibold">Öğretmen Paneli</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = isActivePage(item.href)
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.href === 'overview') {
                      router.push('/teacher/dashboard')
                    } else {
                      router.push(`/teacher/${item.href}`)
                    }
                    setSidebarOpen(false)
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : ''}`} />
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-semibold">Öğretmen Paneli</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = isActivePage(item.href)
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.href === 'overview') {
                      router.push('/teacher/dashboard')
                    } else {
                      router.push(`/teacher/${item.href}`)
                    }
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : ''}`} />
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            
            {/* Öğrenci Seçici - Sadece gerekli sayfalarda göster */}
            {showStudentSelector && (
              <div className="flex items-center">
                <select 
                  value={selectedStudent} 
                  onChange={(e) => onStudentChange?.(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">👥 Tüm Öğrenciler</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      👨‍🎓 {student.user.firstName} {student.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">Öğretmen</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Çıkış Yap"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Page Header Card */}
            <div className="mb-8">
              {getPageHeaderCard(title, description)}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
