'use client'

import { useState, useEffect } from 'react'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  CheckSquare, 
  FileText, 
  Clock,
  AlertCircle,
  MessageCircle,
  BookOpen,
  Calendar,
  BarChart3
} from 'lucide-react'

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTasks: 0,
    pendingQuestions: 0,
    extensionRequests: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [pendingQuestions, setPendingQuestions] = useState([])
  const [extensionRequests, setExtensionRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Paralel olarak tüm verileri yükle
      const [studentsRes, tasksRes, questionsRes, extensionsRes] = await Promise.all([
        fetch('/api/teacher/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/teacher/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/teacher/questions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/teacher/extension-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const studentsData = studentsRes.ok ? await studentsRes.json() : { data: [] }
      const tasksData = tasksRes.ok ? await tasksRes.json() : { data: [] }
      const questionsData = questionsRes.ok ? await questionsRes.json() : { data: [] }
      const extensionsData = extensionsRes.ok ? await extensionsRes.json() : { data: [] }

      setStats({
        totalStudents: studentsData.data?.length || 0,
        totalTasks: tasksData.data?.length || 0,
        pendingQuestions: questionsData.data?.length || 0,
        extensionRequests: extensionsData.data?.length || 0
      })

      setRecentTasks(tasksData.data?.slice(0, 5) || [])
      setOverdueTasks(tasksData.data?.filter((task: any) => 
        new Date(task.endDate) < new Date() && task.status !== 'completed'
      ) || [])
      setPendingQuestions(questionsData.data || [])
      setExtensionRequests(extensionsData.data || [])

    } catch (error) {
      console.error('Dashboard data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'konu_anlatimi':
        return '📚'
      case 'konu_anlatimi_video':
        return '🎥'
      case 'soru_cozumu':
        return '✏️'
      case 'deneme':
        return '📝'
      case 'diger':
        return '📋'
      default:
        return '📋'
    }
  }

  const getTaskTypeText = (type: string) => {
    const types = {
      'konu_anlatimi': 'Konu Anlatımı',
      'konu_anlatimi_video': 'Konu Anlatımı (Video)',
      'soru_cozumu': 'Soru Çözümü',
      'deneme': 'Deneme',
      'diger': 'Diğer'
    }
    return types[type as keyof typeof types] || type
  }

  if (loading) {
    return (
      <TeacherLayout title="Ana Sayfa" description="Öğretmen paneli ana sayfası">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Veriler yükleniyor...</p>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout title="Ana Sayfa" description="Öğretmen paneli ana sayfası">
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Toplam Öğrenci</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Bugünkü Görevler</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalTasks}</p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Cevap Bekleyen Sorular</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.pendingQuestions}</p>
                </div>
                <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Ek Süre Talepleri</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.extensionRequests}</p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bugünkü Görevler Detay Kartı */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckSquare className="h-5 w-5" />
              <span>Bugünkü Görevler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTaskIcon(task.type)}</span>
                      <div>
                        <p className="font-medium text-green-900">{task.description}</p>
                        <p className="text-sm text-green-600">
                          {task.subject?.name || 'Ders'} • {getTaskTypeText(task.type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700">{task.endDate}</p>
                      <p className="text-xs text-green-500">{task.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600 text-center py-4">Bugün için görev bulunmuyor</p>
            )}
          </CardContent>
        </Card>

        {/* Geciken Görevler */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Geciken Görevler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length > 0 ? (
              <div className="space-y-3">
                {overdueTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTaskIcon(task.type)}</span>
                      <div>
                        <p className="font-medium text-red-900">{task.description}</p>
                        <p className="text-sm text-red-600">
                          {task.student?.user?.firstName} {task.student?.user?.lastName} • 
                          {Math.ceil((new Date().getTime() - new Date(task.endDate).getTime()) / (1000 * 60 * 60 * 24))} gün gecikme
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-700">{task.endDate}</p>
                      <p className="text-xs text-red-500">{task.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600 text-center py-4">Geciken görev bulunmuyor</p>
            )}
          </CardContent>
        </Card>

        {/* Cevap Bekleyen Sorular */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <FileText className="h-5 w-5" />
              <span>Cevap Bekleyen Sorular</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingQuestions.length > 0 ? (
              <div className="space-y-3">
                {pendingQuestions.map((question: any) => (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">❓</span>
                      <div>
                        <p className="font-medium text-orange-900">{question.title}</p>
                        <p className="text-sm text-orange-600">
                          {question.student?.user?.firstName} {question.student?.user?.lastName} • 
                          {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                      Yanıtla
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-orange-600 text-center py-4">Cevap bekleyen soru bulunmuyor</p>
            )}
          </CardContent>
        </Card>

        {/* Ek Süre Talepleri */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Clock className="h-5 w-5" />
              <span>Ek Süre Talepleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {extensionRequests.length > 0 ? (
              <div className="space-y-3">
                {extensionRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <p className="font-medium text-purple-900">{request.task?.description}</p>
                        <p className="text-sm text-purple-600">
                          {request.student?.user?.firstName} {request.student?.user?.lastName} • 
                          {request.requestedDays} gün ek süre
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Onayla
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Reddet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-600 text-center py-4">Ek süre talebi bulunmuyor</p>
            )}
          </CardContent>
        </Card>

        {/* Hızlı Erişim Butonları */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim</CardTitle>
            <CardDescription>En sık kullanılan işlemlere hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">👥</span>
                <span className="text-sm">Öğrenci Ekle</span>
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">📝</span>
                <span className="text-sm">Görev Oluştur</span>
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">📚</span>
                <span className="text-sm">Ders Ata</span>
              </Button>
              <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm">Rapor Görüntüle</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}