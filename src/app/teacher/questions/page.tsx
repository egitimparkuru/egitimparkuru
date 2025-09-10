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
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  MessageSquare
} from 'lucide-react'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
    loadStudents()
  }, [])

  const loadQuestions = async () => {
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

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'math', label: 'Matematik' },
    { value: 'science', label: 'Fen Bilimleri' },
    { value: 'turkish', label: 'Türkçe' },
    { value: 'social', label: 'Sosyal Bilimler' },
    { value: 'english', label: 'İngilizce' }
  ]

  return (
    <TeacherLayout
      title="Gelen Sorular"
      description="Öğrencilerinizin size yönelttiği soruları yanıtlayın"
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
                  <span className="text-2xl">❓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Toplam Soru</p>
                <p className="text-3xl font-bold text-indigo-900">0</p>
                <p className="text-xs text-indigo-500">Gelen Sorular</p>
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
                <p className="text-sm font-medium text-orange-600">Bekleyen</p>
                <p className="text-3xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-500">Cevap Bekliyor</p>
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
                <p className="text-xs text-emerald-500">Yanıtlanan Sorular</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-violet-600">Favoriler</p>
                <p className="text-3xl font-bold text-violet-900">0</p>
                <p className="text-xs text-violet-500">Favori Sorular</p>
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
              placeholder="Soru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <p className="text-gray-500 text-lg mb-2">Henüz soru gelmemiş</p>
            <p className="text-sm text-gray-400">Öğrencileriniz henüz soru sormamış</p>
          </div>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}