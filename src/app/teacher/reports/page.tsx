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
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users
} from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
    loadStudents()
  }, [])

  const loadReports = async () => {
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
    { value: 'all', label: 'Tüm Raporlar' },
    { value: 'monthly', label: 'Aylık' },
    { value: 'weekly', label: 'Haftalık' },
    { value: 'daily', label: 'Günlük' }
  ]

  return (
    <TeacherLayout
      title="Raporlar"
      description="Öğrenci performans raporlarını görüntüleyin ve oluşturun"
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
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Toplam Rapor</p>
                <p className="text-3xl font-bold text-indigo-900">0</p>
                <p className="text-xs text-indigo-500">Oluşturulan Raporlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Bu Ay</p>
                <p className="text-3xl font-bold text-emerald-900">0</p>
                <p className="text-xs text-emerald-500">Aylık Raporlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-rose-600">Öğrenci Raporu</p>
                <p className="text-3xl font-bold text-rose-900">0</p>
                <p className="text-xs text-rose-500">Bireysel Raporlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-violet-600">Grup Raporu</p>
                <p className="text-3xl font-bold text-violet-900">0</p>
                <p className="text-xs text-violet-500">Sınıf Raporları</p>
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
              placeholder="Rapor ara..."
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
        <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Rapor
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">Öğrenci Raporu</h3>
                <p className="text-sm text-blue-600">Bireysel performans raporu oluştur</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-900">Sınıf Raporu</h3>
                <p className="text-sm text-green-600">Genel sınıf performans raporu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-purple-900">İlerleme Raporu</h3>
                <p className="text-sm text-purple-600">Zaman içindeki gelişim raporu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Rapor Listesi
          </CardTitle>
          <CardDescription>
            Oluşturduğunuz raporları görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg mb-2">Henüz rapor oluşturulmamış</p>
            <p className="text-sm text-gray-400">İlk raporunuzu oluşturmak için "Yeni Rapor" butonuna tıklayın</p>
          </div>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}