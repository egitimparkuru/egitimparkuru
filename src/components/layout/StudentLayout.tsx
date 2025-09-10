'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  HelpCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface StudentLayoutProps {
  children: React.ReactNode
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('User load error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      router.push('/auth/login')
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home, href: '/student/dashboard' },
    { id: 'lessons', label: 'Derslerim', icon: BookOpen, href: '/student/lessons' },
    { id: 'weekly-tasks', label: 'Haftalık Görevlerim', icon: Calendar, href: '/student/weekly-tasks' },
    { id: 'routine-tasks', label: 'Rutin Görevlerim', icon: Clock, href: '/student/routine-tasks' },
    { id: 'tests', label: 'Testlerim', icon: FileText, href: '/student/tests' },
    { id: 'exams', label: 'Denemelerim', icon: BarChart3, href: '/student/exams' },
    { id: 'calendar', label: 'Takvim', icon: Calendar, href: '/student/calendar' },
    { id: 'ask-question', label: 'Soru Gönder', icon: HelpCircle, href: '/student/ask-question' },
    { id: 'messages', label: 'Mesajlaşma', icon: MessageCircle, href: '/student/messages' }
  ]

  const getPageInfo = () => {
    const currentItem = menuItems.find(item => pathname === item.href)
    if (!currentItem) return { title: 'Öğrenci Paneli', description: 'Eğitim Parkuru Öğrenci Paneli' }
    
    return {
      title: currentItem.label,
      description: `Öğrenci Paneli - ${currentItem.label}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const pageInfo = getPageInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">EduTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">Öğrenci</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {pageInfo.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
