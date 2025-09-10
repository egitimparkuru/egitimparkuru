'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Calendar, Clock, FileText, BarChart3, MessageCircle, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalSubjects: 0,
    completedSubjects: 0,
    pendingQuestions: 0,
    unreadMessages: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Görev istatistikleri
      const tasksResponse = await fetch('/api/student/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        const tasks = tasksData.tasks || []
        
        setStats(prev => ({
          ...prev,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((task: any) => task.status === 'completed').length,
          pendingTasks: tasks.filter((task: any) => task.status === 'pending').length,
          overdueTasks: tasks.filter((task: any) => task.status === 'overdue').length
        }))

        setRecentTasks(tasks.slice(0, 5))
      }

      // Ders istatistikleri
      const subjectsResponse = await fetch('/api/student/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json()
        const subjects = subjectsData.subjects || []
        
        setStats(prev => ({
          ...prev,
          totalSubjects: subjects.length,
          completedSubjects: subjects.filter((subject: any) => subject.status === 'completed').length
        }))
      }

      // Sorular ve mesajlar
      const questionsResponse = await fetch('/api/student/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setStats(prev => ({
          ...prev,
          pendingQuestions: questionsData.questions?.filter((q: any) => q.status === 'pending').length || 0
        }))
      }

    } catch (error) {
      console.error('Dashboard data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Toplam Görev',
      value: stats.totalTasks,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Tamamlanan Görev',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Bekleyen Görev',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Geciken Görev',
      value: stats.overdueTasks,
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    }
  ]

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Hoş Geldin! 👋</h2>
                <p className="text-orange-100">
                  Bugün de harika bir öğrenme günü geçirmeye hazır mısın?
                </p>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm">Bugün</p>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className={`${stat.bgColor} ${stat.borderColor} border-2`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${stat.textColor}`}>
                        {stat.title}
                      </p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.textColor}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Son Görevlerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{task.description}</p>
                        <p className="text-sm text-gray-500">
                          {task.subject?.name} • {new Date(task.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'completed' ? 'Tamamlandı' :
                       task.status === 'overdue' ? 'Gecikti' : 'Bekliyor'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz görev bulunmuyor</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            <BookOpen className="h-6 w-6 mb-2" />
            <span className="text-sm">Derslerim</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-sm">Haftalık Görevler</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
            <HelpCircle className="h-6 w-6 mb-2" />
            <span className="text-sm">Soru Gönder</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            <MessageCircle className="h-6 w-6 mb-2" />
            <span className="text-sm">Mesajlaşma</span>
          </Button>
        </div>
      </div>
    </StudentLayout>
  )
}
