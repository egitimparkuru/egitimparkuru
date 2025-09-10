'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Circle, Clock, BarChart3, Target, TrendingUp } from 'lucide-react'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'

interface Subject {
  id: string
  subject: {
    id: string
    name: string
    class: {
      id: string
      name: string
      level: number
    }
    topics: Array<{
      id: string
      name: string
      order: number
    }>
  }
  progress: {
    completedTopics: number
    totalTopics: number
    progressPercentage: number
  }
  status: string
  assignedAt: string
}

export default function StudentLessons() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [showTopics, setShowTopics] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/student/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Subjects load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'in_progress':
        return 'Devam Ediyor'
      case 'assigned':
        return 'Atandı'
      default:
        return 'Bilinmiyor'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Dersler yükleniyor...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Derslerim</h1>
            <p className="text-gray-600">Atanmış dersleriniz ve ilerleme durumunuz</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Toplam Ders</p>
              <p className="text-2xl font-bold text-orange-600">{subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam Ders</p>
                  <p className="text-2xl font-bold text-blue-900">{subjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Tamamlanan</p>
                  <p className="text-2xl font-bold text-green-900">
                    {subjects.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Devam Eden</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {subjects.filter(s => s.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Ortalama İlerleme</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {subjects.length > 0 
                      ? Math.round(subjects.reduce((acc, s) => acc + s.progress.progressPercentage, 0) / subjects.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {subject.subject?.name || 'Ders seçilmedi'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {subject.subject?.class?.name || 'Sınıf bilgisi yok'} • {subject.subject?.class?.level || 'N/A'}. Sınıf
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subject.status)}`}>
                    {getStatusText(subject.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">İlerleme</span>
                    <span className="text-sm text-gray-500">
                      {subject.progress.completedTopics}/{subject.progress.totalTopics} konu
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(subject.progress.progressPercentage)}`}
                      style={{ width: `${subject.progress.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    %{subject.progress.progressPercentage} tamamlandı
                  </p>
                </div>

                {/* Topics Preview */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Konular:</p>
                  <div className="space-y-1">
                    {subject.subject?.topics?.slice(0, 3).map((topic, index) => (
                      <div key={topic.id} className="flex items-center text-sm">
                        <Circle className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="text-gray-600">{topic.name}</span>
                      </div>
                    ))}
                    {(subject.subject?.topics?.length || 0) > 3 && (
                      <p className="text-xs text-gray-500 ml-5">
                        +{(subject.subject?.topics?.length || 0) - 3} konu daha
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setSelectedSubject(subject)
                      setShowTopics(true)
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Konuları Görüntüle
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {subjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ders atanmamış</h3>
              <p className="text-gray-500">
                Öğretmeniniz size ders atadığında burada görünecek.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Topics Modal */}
        {showTopics && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedSubject.subject?.name || 'Ders seçilmedi'} - Konular
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSubject.subject?.class?.name || 'Sınıf bilgisi yok'} • {selectedSubject.subject?.class?.level || 'N/A'}. Sınıf
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowTopics(false)}
                    variant="outline"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {selectedSubject.subject?.topics?.map((topic, index) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-3">
                          {index + 1}.
                        </span>
                        <span className="text-gray-900">{topic.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Bekliyor</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setShowTopics(false)}
                    variant="outline"
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
