'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Target, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react'
import StudentLayout from '@/components/layout/StudentLayout'

interface TestResult {
  id: string
  taskId: string
  description: string
  subject: string
  grade: string
  testCount: number
  correctAnswers: number
  wrongAnswers: number
  blankAnswers: number
  totalScore: number
  completedAt: string
  status: string
  resourceName: string
}

export default function StudentTestsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'recent' | 'subject'>('all')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    loadTestResults()
  }, [])

  const loadTestResults = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token bulunamadı')
        return
      }

      const response = await fetch('/api/student/test-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTestResults(data.testResults || [])
      } else {
        console.error('Test sonuçları yüklenirken hata:', response.statusText)
      }
    } catch (error) {
      console.error('Test sonuçları yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'overdue':
        return 'Geç Kalındı'
      default:
        return 'Bilinmiyor'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Mükemmel'
    if (score >= 60) return 'İyi'
    if (score >= 40) return 'Orta'
    return 'Geliştirilmeli'
  }

  const filteredResults = testResults.filter(result => {
    if (filter === 'recent') {
      const resultDate = new Date(result.completedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return resultDate >= weekAgo
    }
    if (filter === 'subject' && selectedSubject) {
      return result.subject === selectedSubject
    }
    return true
  })

  const subjects = [...new Set(testResults.map(result => result.subject))]

  const calculateAverageScore = () => {
    if (testResults.length === 0) return 0
    const total = testResults.reduce((sum, result) => sum + result.totalScore, 0)
    return Math.round(total / testResults.length)
  }

  const calculateTotalTests = () => {
    return testResults.length
  }

  const calculateTotalQuestions = () => {
    return testResults.reduce((sum, result) => sum + result.testCount, 0)
  }

  const calculateCorrectAnswers = () => {
    return testResults.reduce((sum, result) => sum + result.correctAnswers, 0)
  }

  return (
    <StudentLayout
      title="Testlerim"
      description="Çözdüğünüz testlerin sonuçlarını görüntüleyin ve performansınızı takip edin"
    >
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam Test</p>
                  <p className="text-2xl font-bold text-blue-900">{calculateTotalTests()}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Ortalama Puan</p>
                  <p className="text-2xl font-bold text-green-900">{calculateAverageScore()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Toplam Soru</p>
                  <p className="text-2xl font-bold text-purple-900">{calculateTotalQuestions()}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Doğru Cevap</p>
                  <p className="text-2xl font-bold text-orange-900">{calculateCorrectAnswers()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  Tümü
                </Button>
                <Button
                  variant={filter === 'recent' ? 'default' : 'outline'}
                  onClick={() => setFilter('recent')}
                  size="sm"
                >
                  Son 7 Gün
                </Button>
                <Button
                  variant={filter === 'subject' ? 'default' : 'outline'}
                  onClick={() => setFilter('subject')}
                  size="sm"
                >
                  Derse Göre
                </Button>
              </div>
              
              {filter === 'subject' && (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Ders seçin</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Sonuçları Listesi */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100">
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center space-x-2">
              <Target className="h-6 w-6" />
              <span>Test Sonuçlarım</span>
            </CardTitle>
            <p className="text-blue-600">
              {filteredResults.length} test sonucu bulundu
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Test sonuçları yükleniyor...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Henüz test sonucu bulunmuyor</p>
                <p className="text-sm text-gray-500 mt-1">
                  Test çözümü görevlerini tamamladığınızda sonuçlar burada görünecek
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {result.description}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {getStatusText(result.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{result.subject} - {result.grade}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{result.testCount} soru</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {new Date(result.completedAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {new Date(result.completedAt).toLocaleTimeString('tr-TR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Test Sonuçları Detayı */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Test Sonuçları</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium text-gray-700">Doğru</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium text-gray-700">Yanlış</span>
                                </div>
                                <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <AlertCircle className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Boş</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-600">{result.blankAnswers}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <BarChart3 className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium text-gray-700">Net Puan</span>
                                </div>
                                <p className={`text-2xl font-bold ${getScoreColor(result.totalScore)}`}>
                                  {result.totalScore}
                                </p>
                                <p className={`text-xs ${getScoreColor(result.totalScore)}`}>
                                  {getScoreText(result.totalScore)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Kaynak Bilgisi */}
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Kaynak:</span> {result.resourceName}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
