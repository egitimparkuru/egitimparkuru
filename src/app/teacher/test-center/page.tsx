'use client'

import React, { useState, useEffect } from 'react'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorToast, SuccessToast } from '@/components/ui/ErrorToast'
import { SkeletonCard, SkeletonStats, LoadingSpinner } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { useApiError } from '@/hooks/useApiError'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users,
  Filter,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react'

interface TestResult {
  id: string
  studentId: string
  studentName: string
  taskId: string
  taskName: string
  subjectName: string
  completedAt: string
  score?: number
  totalQuestions?: number
  correctAnswers?: number
  wrongAnswers?: number
  duration?: number // minutes
  status: 'completed' | 'in_progress' | 'failed'
  notes?: string
}

interface TestStats {
  totalTests: number
  completedTests: number
  averageScore: number
  totalStudents: number
}

export default function TestCenter() {
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('all') // all, today, week, month
  const [statusFilter, setStatusFilter] = useState<string>('all') // all, completed, in_progress, failed
  const [showFilters, setShowFilters] = useState(false)
  
  const { error: apiError, handleApiError, clearError } = useApiError()

  // API hooks
  const { data: students, loading: studentsLoading, execute: loadStudents } = useApi(
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teacher/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load students')
      const data = await response.json()
      return data.data || []
    },
    { 
      immediate: false,
      cacheKey: 'students',
      cacheTime: 5 * 60 * 1000
    }
  )

  const { data: testResults, loading: testsLoading, execute: loadTestResults } = useApi<TestResult[]>(
    async () => {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedStudent) params.append('studentId', selectedStudent)
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter)
      if (statusFilter !== 'all') params.append('statusFilter', statusFilter)
      
      const response = await fetch(`/api/teacher/test-results?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load test results')
      const data = await response.json()
      return data.data || []
    },
    { 
      immediate: false
    }
  )

  const { data: stats, loading: statsLoading, execute: loadStats } = useApi<TestStats>(
    async () => {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedStudent) params.append('studentId', selectedStudent)
      
      const response = await fetch(`/api/teacher/test-stats?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load test stats')
      const data = await response.json()
      return data.data
    },
    { 
      immediate: false
    }
  )

  // Load data on component mount and when filters change
  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    loadTestResults()
    loadStats()
  }, [selectedStudent, dateFilter, statusFilter])

  const loading = testsLoading || studentsLoading || statsLoading

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'in_progress':
        return 'Devam Ediyor'
      case 'failed':
        return 'Başarısız'
      default:
        return 'Bilinmiyor'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateScorePercentage = (score?: number, total?: number) => {
    if (!score || !total) return 0
    return Math.round((score / total) * 100)
  }

  const exportResults = () => {
    // CSV export functionality
    const csvContent = [
      ['Öğrenci', 'Görev', 'Ders', 'Durum', 'Puan', 'Tarih', 'Süre (dk)'],
      ...(testResults || []).map(result => [
        result.studentName,
        result.taskName,
        result.subjectName,
        getStatusText(result.status),
        result.score || '-',
        formatDate(result.completedAt),
        result.duration || '-'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `test-sonuclari-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <TeacherLayout
      title="Test Merkezi" 
      description="Öğrenci test sonuçlarını görüntüleyin ve analiz edin"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students || []}
    >
      <ErrorBoundary>
        <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtreler
          </Button>
          <Button
            onClick={exportResults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button
            onClick={() => {
              loadTestResults()
              loadStats()
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğrenci Filtresi
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Öğrenciler</option>
                    {(students || []).map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih Filtresi
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Zamanlar</option>
                    <option value="today">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum Filtresi
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="failed">Başarısız</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {statsLoading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Toplam Test</p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.totalTests || 0}</p>
                  </div>
                  <BookOpen className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Tamamlanan</p>
                    <p className="text-2xl font-bold text-green-900">{stats?.completedTests || 0}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Ortalama Puan</p>
                    <p className="text-2xl font-bold text-purple-900">{stats?.averageScore || 0}%</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Aktif Öğrenci</p>
                    <p className="text-2xl font-bold text-orange-900">{stats?.totalStudents || 0}</p>
                  </div>
                  <Users className="h-12 w-12 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Test Sonuçları
              {selectedStudent && (
                <span className="text-sm font-normal text-gray-500">
                  - {(students || []).find((s: any) => s.id === selectedStudent)?.user.firstName} {(students || []).find((s: any) => s.id === selectedStudent)?.user.lastName}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Öğrenci</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Görev</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ders</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Puan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Süre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(testResults || []).map((result) => (
                      <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {result.studentName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{result.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">{result.taskName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-600">{result.subjectName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {getStatusText(result.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {result.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{result.score}/{result.totalQuestions}</span>
                              <span className="text-sm text-gray-500">
                                ({calculateScorePercentage(result.score, result.totalQuestions)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{formatDate(result.completedAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {result.duration ? (
                            <span className="text-sm text-gray-600">{result.duration} dk</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Detay
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(testResults || []).length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Test Sonucu Bulunamadı</h3>
                    <p className="text-gray-500">
                      {selectedStudent ? 'Seçili öğrenci için test sonucu bulunamadı.' : 'Henüz hiç test sonucu bulunmuyor.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error and Success Toasts */}
        {apiError && (
          <ErrorToast 
            error={apiError} 
            onClose={clearError} 
          />
        )}
        </div>
      </ErrorBoundary>
    </TeacherLayout>
  )
}
