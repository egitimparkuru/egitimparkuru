'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    // TODO: API endpoint'i oluşturulacak
    setLoading(false)
  }

  return (
    <TeacherLayout
      title="Deneme Merkezi"
      description="Öğrencilerinize deneme sınavları oluşturun ve yönetin"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Toplam Sınav</p>
                <p className="text-3xl font-bold text-purple-900">0</p>
                <p className="text-xs text-purple-500">Oluşturulan Sınavlar</p>
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
                <p className="text-sm font-medium text-emerald-600">Tamamlanan</p>
                <p className="text-3xl font-bold text-emerald-900">0</p>
                <p className="text-xs text-emerald-500">Bitirilen Sınavlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-600">Devam Eden</p>
                <p className="text-3xl font-bold text-amber-900">0</p>
                <p className="text-xs text-amber-500">Aktif Sınavlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Katılımcı</p>
                <p className="text-3xl font-bold text-indigo-900">0</p>
                <p className="text-xs text-indigo-500">Toplam Katılımcı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sınav Listesi</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Users className="h-4 w-4 mr-2" />
            Grup Sınavı
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sınav Oluştur
          </Button>
        </div>
      </div>

      {/* Exams List */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <p className="text-gray-500 text-lg mb-2">Henüz sınav oluşturulmamış</p>
            <p className="text-sm text-gray-400">İlk sınavınızı oluşturmak için "Yeni Sınav Oluştur" butonuna tıklayın</p>
          </div>
        </CardContent>
      </Card>
    </TeacherLayout>
  )
}