'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Send,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Clock
} from 'lucide-react'

export default function SupportPage() {
  const [tickets, setTickets] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
    loadStudents()
  }, [])

  const loadTickets = async () => {
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
    { value: 'all', label: 'Tüm Destek Talepleri' },
    { value: 'open', label: 'Açık' },
    { value: 'in_progress', label: 'İşlemde' },
    { value: 'resolved', label: 'Çözüldü' }
  ]

  const priorities = [
    { value: 'low', label: 'Düşük', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Orta', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Acil', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <TeacherLayout
      title="Teknik Destek"
      description="Teknik sorunlarınız için destek talebi oluşturun"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎫</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Toplam Talep</p>
                <p className="text-3xl font-bold text-indigo-900">0</p>
                <p className="text-xs text-indigo-500">Destek Talepleri</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Açık</p>
                <p className="text-3xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-500">Bekleyen Talepler</p>
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
                <p className="text-sm font-medium text-emerald-600">Çözüldü</p>
                <p className="text-3xl font-bold text-emerald-900">0</p>
                <p className="text-xs text-emerald-500">Tamamlanan Talepler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-violet-600">Ortalama</p>
                <p className="text-3xl font-bold text-violet-900">0h</p>
                <p className="text-xs text-violet-500">Yanıt Süresi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">Canlı Destek</h3>
                <p className="text-sm text-blue-600">Anında yardım alın</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-900">E-posta</h3>
                <p className="text-sm text-green-600">destek@edutracktpro.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-purple-900">Telefon</h3>
                <p className="text-sm text-purple-600">+90 (212) 555-0123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-indigo-600" />
            Yeni Destek Talebi
          </CardTitle>
          <CardDescription>
            Teknik sorununuz için destek talebi oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                placeholder="Sorununuzu kısaca açıklayın"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Sorununuzu detaylı olarak açıklayın"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg">
              <Send className="h-4 w-4 mr-2" />
              Talep Gönder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Talep ara..."
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

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Destek Talepleri
          </CardTitle>
          <CardDescription>
            Oluşturduğunuz destek taleplerini görüntüleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-gray-500 text-lg mb-2">Henüz destek talebi oluşturulmamış</p>
            <p className="text-sm text-gray-400">Yukarıdaki formu kullanarak ilk talebinizi oluşturun</p>
          </div>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}