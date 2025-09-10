'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, BookOpen, FileText, BarChart3, Plus } from 'lucide-react'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Task {
  id: string
  description: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  type: string
  resourceName: string
  status: string
  subject: {
    id: string
    name: string
    class: {
      name: string
      level: number
    }
  }
  teacher: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

export default function WeeklyTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [completionData, setCompletionData] = useState({
    completionNote: '',
    correctAnswers: '',
    wrongAnswers: '',
    blankAnswers: ''
  })
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/student/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Student tasks loaded:', data.tasks)
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Tasks load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayTasks = tasks.filter(task => {
      const startDate = new Date(task.startDate).toISOString().split('T')[0]
      const endDate = new Date(task.endDate).toISOString().split('T')[0]
      return dateStr >= startDate && dateStr <= endDate
    })
    console.log(`Tasks for ${dateStr}:`, dayTasks)
    return dayTasks
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatDate = (date: Date) => {
    return date.getDate().toString()
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'konu_anlatimi':
        return <BookOpen className="h-4 w-4" />
      case 'soru_cozumu':
        return <FileText className="h-4 w-4" />
      case 'deneme':
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'konu_anlatimi':
        return 'bg-blue-100 text-blue-800'
      case 'soru_cozumu':
        return 'bg-green-100 text-green-800'
      case 'deneme':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskTypeText = (type: string) => {
    switch (type) {
      case 'konu_anlatimi':
        return 'Konu Anlatımı'
      case 'konu_anlatimi_video':
        return 'Video Anlatımı'
      case 'soru_cozumu':
        return 'Soru Çözümü'
      case 'deneme':
        return 'Deneme'
      default:
        return 'Diğer'
    }
  }

  const openCompleteModal = (task: Task) => {
    setCompletingTask(task)
    setCompletionData({
      completionNote: '',
      correctAnswers: '',
      wrongAnswers: '',
      blankAnswers: ''
    })
    setShowCompleteModal(true)
  }

  const closeCompleteModal = () => {
    setShowCompleteModal(false)
    setCompletingTask(null)
    setCompletionData({
      completionNote: '',
      correctAnswers: '',
      wrongAnswers: '',
      blankAnswers: ''
    })
  }

  const handleCompleteTask = async () => {
    if (!completingTask) return

    try {
      setCompleting(true)
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
        return
      }

      // Test çözümü için doğrulama
      if (completingTask.type === 'soru_cozumu' && completingTask.testCount) {
        const correct = parseInt(completionData.correctAnswers) || 0
        const wrong = parseInt(completionData.wrongAnswers) || 0
        const blank = parseInt(completionData.blankAnswers) || 0

        if (correct + wrong + blank !== completingTask.testCount) {
          alert(`Toplam cevap sayısı (${correct + wrong + blank}) test sayısı (${completingTask.testCount}) ile eşleşmiyor!`)
          return
        }

        if (correct < 0 || wrong < 0 || blank < 0) {
          alert('Cevap sayıları negatif olamaz!')
          return
        }
      }

      const response = await fetch(`/api/student/tasks/${completingTask.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completionNote: completionData.completionNote,
          correctAnswers: completingTask.type === 'soru_cozumu' ? parseInt(completionData.correctAnswers) || 0 : undefined,
          wrongAnswers: completingTask.type === 'soru_cozumu' ? parseInt(completionData.wrongAnswers) || 0 : undefined,
          blankAnswers: completingTask.type === 'soru_cozumu' ? parseInt(completionData.blankAnswers) || 0 : undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Görev başarıyla tamamlandı!')
        
        // Görev listesini güncelle
        setTasks(prev => prev.map(task => 
          task.id === completingTask.id 
            ? { ...task, status: result.task.status, completedAt: result.task.completedAt }
            : task
        ))

        closeCompleteModal()
        
        // Sayfayı yenile
        window.location.reload()
        
        // Eğer geç kaldıysa ve ek süre talep edebiliyorsa
        if (result.isOverdue && result.canRequestExtension) {
          if (confirm('Görev geç kalınarak tamamlandı. Ek süre talep etmek ister misiniz?')) {
            // Ek süre talep sayfasına yönlendir veya modal aç
            // Bu kısmı daha sonra ekleyeceğiz
          }
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Görev tamamlanırken hata oluştu')
      }
    } catch (error) {
      console.error('Görev tamamlama hatası:', error)
      alert('Görev tamamlanırken hata oluştu')
    } finally {
      setCompleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'overdue':
        return 'Gecikti'
      case 'pending':
        return 'Bekliyor'
      default:
        return 'Bilinmiyor'
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Görevler yükleniyor...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const weekDays = getWeekDays()
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Haftalık Görevlerim</h1>
            <p className="text-gray-600">Bu haftaki görevlerinizi takvim görünümünde görüntüleyin</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={goToToday}
              variant="outline"
              size="sm"
            >
              Bugün
            </Button>
            <Button
              onClick={() => navigateWeek('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigateWeek('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam Görev</p>
                  <p className="text-xl font-bold text-blue-900">{totalTasks}</p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Tamamlanan</p>
                  <p className="text-xl font-bold text-green-900">{completedTasks}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Bekleyen</p>
                  <p className="text-xl font-bold text-yellow-900">{pendingTasks}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Geciken</p>
                  <p className="text-xl font-bold text-red-900">{overdueTasks}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week Navigation */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-indigo-900">
                  {weekDays[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-indigo-600 mt-1">
                  {currentWeek.getFullYear()} • Haftalık Görev Takvimi
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-indigo-700">
                    {totalTasks} Görev
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Calendar */}
            <div className="hidden lg:grid grid-cols-7 gap-4">
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="bg-white/70 rounded-lg p-3 mb-2">
                    <div className="text-sm font-semibold text-indigo-800">{day}</div>
                  </div>
                </div>
              ))}
              {weekDays.map((day, index) => {
                const dayTasks = getTasksForDay(day)
                const dayName = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'][index]
                return (
                  <div
                    key={index}
                    className={`relative rounded-xl border-2 min-h-[200px] transition-all duration-200 hover:shadow-lg ${
                      isToday(day)
                        ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 shadow-md'
                        : 'bg-white/80 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`p-4 border-b ${
                      isToday(day) ? 'border-orange-200' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${
                          isToday(day) ? 'text-orange-900' : 'text-gray-900'
                        }`}>
                          {formatDate(day)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          isToday(day) 
                            ? 'bg-orange-200 text-orange-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {dayTasks.length} görev
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="p-3 space-y-2 max-h-[140px] overflow-y-auto">
                      {dayTasks.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="text-gray-400 text-2xl mb-2">📝</div>
                          <p className="text-xs text-gray-500">Görev yok</p>
                        </div>
                      ) : (
                        dayTasks.map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className={`group cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-105 ${
                              task.status === 'completed' 
                                ? 'bg-green-50 border border-green-200' 
                                : task.status === 'overdue'
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100'
                            }`}
                            onClick={() => {
                              setSelectedTask(task)
                              setShowTaskModal(true)
                            }}
                          >
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 mt-0.5">
                                {getTaskTypeIcon(task.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${
                                  task.status === 'completed' 
                                    ? 'text-green-800 line-through' 
                                    : task.status === 'overdue'
                                    ? 'text-red-800'
                                    : 'text-indigo-800'
                                }`}>
                                  {task.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {task.subject?.name || 'Ders seçilmedi'}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.status === 'completed' 
                                      ? 'bg-green-200 text-green-700' 
                                      : task.status === 'overdue'
                                      ? 'bg-red-200 text-red-700'
                                      : 'bg-indigo-200 text-indigo-700'
                                  }`}>
                                    {getTaskTypeText(task.type)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {task.endTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Calendar */}
            <div className="lg:hidden">
              <div className="space-y-4">
                {weekDays.map((day, index) => {
                  const dayTasks = getTasksForDay(day)
                  const dayName = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'][index]
                  return (
                    <div
                      key={index}
                      className={`rounded-xl border-2 p-4 ${
                        isToday(day)
                          ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className={`text-lg font-bold ${
                            isToday(day) ? 'text-orange-900' : 'text-gray-900'
                          }`}>
                            {dayName}
                          </div>
                          <div className={`text-sm ${
                            isToday(day) ? 'text-orange-700' : 'text-gray-600'
                          }`}>
                            {day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          isToday(day) 
                            ? 'bg-orange-200 text-orange-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {dayTasks.length} görev
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2">
                        {dayTasks.length === 0 ? (
                          <div className="text-center py-4">
                            <div className="text-gray-400 text-xl mb-2">📝</div>
                            <p className="text-sm text-gray-500">Bu gün için görev yok</p>
                          </div>
                        ) : (
                          dayTasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className={`rounded-lg p-3 ${
                                task.status === 'completed' 
                                  ? 'bg-green-50 border border-green-200' 
                                  : task.status === 'overdue'
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-indigo-50 border border-indigo-200'
                              }`}
                              onClick={() => {
                                setSelectedTask(task)
                                setShowTaskModal(true)
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getTaskTypeIcon(task.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${
                                    task.status === 'completed' 
                                      ? 'text-green-800 line-through' 
                                      : task.status === 'overdue'
                                      ? 'text-red-800'
                                      : 'text-indigo-800'
                                  }`}>
                                    {task.description}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {task.subject?.name || 'Ders seçilmedi'}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      task.status === 'completed' 
                                        ? 'bg-green-200 text-green-700' 
                                        : task.status === 'overdue'
                                        ? 'bg-red-200 text-red-700'
                                        : 'bg-indigo-200 text-indigo-700'
                                    }`}>
                                      {getTaskTypeText(task.type)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {task.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
              Bu Haftaki Görevler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskModal(true)
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTaskTypeColor(task.type)}`}>
                        {getTaskTypeIcon(task.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.description}</h4>
                        <p className="text-sm text-gray-600">
                          {task.subject?.name || 'Ders seçilmedi'} • {task.subject?.class?.name || 'Sınıf bilgisi yok'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.startDate).toLocaleDateString('tr-TR')} - {new Date(task.endDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                        {getTaskTypeText(task.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Bu hafta için görev bulunmuyor</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Detail Modal */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTaskTypeColor(selectedTask.type)}`}>
                      {getTaskTypeIcon(selectedTask.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedTask.description}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedTask.subject?.name || 'Ders seçilmedi'} • {selectedTask.subject?.class?.name || 'Sınıf bilgisi yok'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowTaskModal(false)}
                    variant="outline"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Görev Detayları</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tür:</span>
                        <span className="font-medium">{getTaskTypeText(selectedTask.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kaynak:</span>
                        <span className="font-medium">{selectedTask.resourceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Başlangıç:</span>
                        <span className="font-medium">
                          {new Date(selectedTask.startDate).toLocaleDateString('tr-TR')}
                          {selectedTask.startTime && ` - ${selectedTask.startTime}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bitiş:</span>
                        <span className="font-medium">
                          {new Date(selectedTask.endDate).toLocaleDateString('tr-TR')}
                          {selectedTask.endTime && ` - ${selectedTask.endTime}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durum:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                          {getStatusText(selectedTask.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Öğretmen</h4>
                    <p className="text-gray-600">
                      {selectedTask.teacher.user.firstName} {selectedTask.teacher.user.lastName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setShowTaskModal(false)}
                    variant="outline"
                  >
                    Kapat
                  </Button>
                  {selectedTask.status === 'pending' && (
                    <Button 
                      onClick={() => openCompleteModal(selectedTask)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Görevi Tamamla
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Görev Tamamlama Modalı */}
        {showCompleteModal && completingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Görevi Tamamla
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completingTask.description}
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Test Çözümü Formu */}
                {completingTask.type === 'soru_cozumu' && completingTask.testCount && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Test Sonuçları ({completingTask.testCount} soru)
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Doğru Sayısı
                        </label>
                        <input
                          type="number"
                          value={completionData.correctAnswers}
                          onChange={(e) => setCompletionData(prev => ({ ...prev, correctAnswers: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max={completingTask.testCount}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Yanlış Sayısı
                        </label>
                        <input
                          type="number"
                          value={completionData.wrongAnswers}
                          onChange={(e) => setCompletionData(prev => ({ ...prev, wrongAnswers: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max={completingTask.testCount}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Boş Sayısı
                        </label>
                        <input
                          type="number"
                          value={completionData.blankAnswers}
                          onChange={(e) => setCompletionData(prev => ({ ...prev, blankAnswers: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max={completingTask.testCount}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      * 4 yanlış = 1 doğru götürür
                    </p>
                  </div>
                )}

                {/* Tamamlama Notu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamamlama Notu (İsteğe bağlı)
                  </label>
                  <textarea
                    value={completionData.completionNote}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, completionNote: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Görev hakkında notlarınızı yazabilirsiniz..."
                  />
                </div>

                {/* Görev Detayları */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Görev Detayları</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tür:</span>
                      <span className="ml-2 font-medium">{getTaskTypeText(completingTask.type)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kaynak:</span>
                      <span className="ml-2 font-medium">{completingTask.resourceName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bitiş Tarihi:</span>
                      <span className="ml-2 font-medium">
                        {new Date(completingTask.endDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    {completingTask.testCount && (
                      <div>
                        <span className="text-gray-600">Soru Sayısı:</span>
                        <span className="ml-2 font-medium">{completingTask.testCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={closeCompleteModal}
                    variant="outline"
                    disabled={completing}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCompleteTask}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={completing}
                  >
                    {completing ? 'Tamamlanıyor...' : 'Görevi Tamamla'}
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
