'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Send, 
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Archive,
  MessageSquare
} from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    loadStudents()
  }, [])

  const loadMessages = async () => {
    // TODO: API endpoint'i oluşturulacak
    setLoading(false)
  }

  const loadStudents = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const response = await fetch('/api/teacher/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error('Students load error:', error)
    }
  }

  const filters = [
    { value: 'all', label: 'Tüm Mesajlar' },
    { value: 'unread', label: 'Okunmamış' },
    { value: 'important', label: 'Önemli' },
    { value: 'archived', label: 'Arşivlenmiş' }
  ]

  return (
    <TeacherLayout
      title="Mesajlaşma"
      description="Öğrenciler ve velilerle mesajlaşın"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Toplam Mesaj</p>
                <p className="text-3xl font-bold text-blue-900">0</p>
                <p className="text-xs text-blue-500">Gelen Mesajlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📨</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Okunmamış</p>
                <p className="text-3xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-500">Yeni Mesajlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Cevaplanan</p>
                <p className="text-3xl font-bold text-emerald-900">0</p>
                <p className="text-xs text-emerald-500">Yanıtlanan Mesajlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Önemli</p>
                <p className="text-3xl font-bold text-purple-900">0</p>
                <p className="text-xs text-purple-500">Önemli Mesajlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Mesaj Listesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 text-sm">Henüz mesaj yok</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Mesaj Detayı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500 text-lg mb-2">Mesaj seçin</p>
                <p className="text-sm text-gray-400">Görüntülemek için sol taraftan bir mesaj seçin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-purple-600" />
              Hızlı Mesaj Gönder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  placeholder="Mesajınızı yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}