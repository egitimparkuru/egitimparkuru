'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  Star,
  X,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([]) // Tamamlanan görevler
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Görev ekleme formu state'leri
  const [newTask, setNewTask] = useState({
    description: '',
    taskDate: '', // Görev tarihi
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    subject: '',
    type: 'konu_anlatimi',
    resourceName: '',
    pageStart: '',
    pageEnd: '',
    videoCount: '',
    testCount: ''
  })

  // Öğrenciye atanmış dersler
  const [studentSubjects, setStudentSubjects] = useState([])

  useEffect(() => {
    loadTasks()
    loadStudents()
    if (selectedStudent) {
      loadStudentSubjects()
    }
  }, [selectedStudent])

  // Öğrenciye atanmış dersleri yükle
  const loadStudentSubjects = async () => {
    if (!selectedStudent) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/teacher/student-subjects-simple?studentId=${selectedStudent}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Student subjects response:', data)
        setStudentSubjects(data.subjects || [])
      } else {
        console.error('Student subjects fetch failed:', response.status)
        const errorData = await response.json()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Student subjects fetch error:', error)
    }
  }

  const loadTasks = async () => {
    if (!selectedStudent) {
      setTasks([])
      setCompletedTasks([])
      setLoading(false)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      
      // Hem aktif görevleri hem de tamamlanan görevleri yükle
      const [tasksResponse, completedResponse] = await Promise.all([
        fetch(`/api/teacher/tasks?studentId=${selectedStudent}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/teacher/completed-tasks?studentId=${selectedStudent}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])
      
      if (tasksResponse.ok) {
        const data = await tasksResponse.json()
        setTasks(data.tasks || [])
      } else {
        console.error('Görevler yüklenirken hata:', tasksResponse.status)
        setTasks([])
      }
      
      if (completedResponse.ok) {
        const data = await completedResponse.json()
        setCompletedTasks(data.tasks || [])
      } else {
        console.error('Tamamlanan görevler yüklenirken hata:', completedResponse.status)
        setCompletedTasks([])
      }
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error)
      setTasks([])
      setCompletedTasks([])
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    const token = localStorage.getItem('accessToken')
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

  // Haftalık takvim fonksiyonları
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

  const formatDate = (date: Date) => {
    return date.getDate().toString()
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'konu_anlatimi':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'konu_anlatimi_video':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'soru_cozumu':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'deneme':
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
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


  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter((task: any) => {
      const startDate = new Date(task.startDate).toISOString().split('T')[0]
      const endDate = new Date(task.endDate).toISOString().split('T')[0]
      return dateStr >= startDate && dateStr <= endDate
    })
  }

  // Görev ekleme fonksiyonları
  const handleAddTask = () => {
    if (!selectedStudent) {
      alert('Lütfen önce bir öğrenci seçin')
      return
    }
    setShowTaskModal(true)
  }

  const handleSaveTask = async () => {
    // Double submission koruması
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teacher/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          studentId: selectedStudent
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Görev oluşturuldu:', data.task)
        setShowTaskModal(false)
        resetTaskForm()
        loadTasks() // Görevleri yeniden yükle
        alert('Görev başarıyla oluşturuldu!')
      } else {
        const errorData = await response.json()
        console.error('Görev oluşturma hatası:', errorData)
        const errorMessage = errorData.error || 'Bilinmeyen hata'
        alert('Görev oluşturulurken hata oluştu: ' + errorMessage)
      }
    } catch (error) {
      console.error('Görev oluşturma hatası:', error)
      alert('Görev oluşturulurken hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelTask = () => {
    setShowTaskModal(false)
    resetTaskForm()
  }

  // Görev düzenleme fonksiyonu
  const handleEditTask = (task: any) => {
    setNewTask({
      description: task.description,
      taskDate: task.startDate,
      startDate: task.startDate,
      startTime: task.startTime || '00:00',
      endDate: task.endDate,
      endTime: task.endTime || '23:59',
      subject: task.subjectId || '',
      type: task.type,
      resourceName: task.resourceName || '',
      pageStart: task.pageStart || '',
      pageEnd: task.pageEnd || '',
      videoCount: task.videoCount || '',
      testCount: task.testCount || ''
    })
    setShowTaskModal(true)
  }

  // Görev silme fonksiyonu
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/teacher/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        loadTasks()
        alert('Görev başarıyla silindi!')
      } else {
        alert('Görev silinirken hata oluştu!')
      }
    } catch (error) {
      console.error('Görev silme hatası:', error)
      alert('Görev silinirken hata oluştu!')
    }
  }

  const resetTaskForm = () => {
    setNewTask({
      description: '',
      taskDate: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      subject: '',
      type: 'konu_anlatimi',
      resourceName: '',
      pageStart: '',
      pageEnd: '',
      videoCount: '',
      testCount: ''
    })
  }

  // Görev tarihi değiştiğinde başlangıç ve bitiş tarihlerini hesapla
  const handleTaskDateChange = (taskDate: string) => {
    if (taskDate) {
      const selectedDate = new Date(taskDate)
      
      setNewTask(prev => ({
        ...prev,
        taskDate,
        startDate: taskDate, // Aynı tarih
        endDate: taskDate,   // Aynı tarih
        startTime: '00:00',
        endTime: '23:59'
      }))
    } else {
      setNewTask(prev => ({
        ...prev,
        taskDate,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: ''
      }))
    }
  }

  // Hafta navigasyonu
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  return (
    <TeacherLayout
      title="Görevler"
      description="Öğrencilerinize verdiğiniz görevleri yönetin"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Toplam Görev</p>
                <p className="text-3xl font-bold text-emerald-900">0</p>
                <p className="text-xs text-emerald-500">Aktif Görevler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Tamamlanan</p>
                <p className="text-3xl font-bold text-indigo-900">0</p>
                <p className="text-xs text-indigo-500">Bitirilen Görevler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-rose-600">Geciken</p>
                <p className="text-3xl font-bold text-rose-900">0</p>
                <p className="text-xs text-rose-500">Geciken Görevler</p>
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
                <p className="text-sm font-medium text-violet-600">Bu Hafta</p>
                <p className="text-3xl font-bold text-violet-900">0</p>
                <p className="text-xs text-violet-500">Haftalık Görevler</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Student Info */}
      {selectedStudent && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-100 border-orange-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">👨‍🎓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-orange-900">
                  {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName} için Görev Yönetimi
                </h3>
                <p className="text-sm text-orange-600">
                  Görevleri görüntülüyor ve yönetiyorsunuz
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Görev Yönetimi</h2>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={!selectedStudent}
          >
            <Users className="h-4 w-4 mr-2" />
            Grup Görevi
          </Button>
          <Button 
            onClick={handleAddTask}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            disabled={!selectedStudent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Görev Ekle
          </Button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-indigo-900 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-indigo-600" />
                Haftalık Görev Takvimi
              </CardTitle>
              <p className="text-indigo-600 mt-1">
                {getWeekDays()[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {getWeekDays()[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {currentWeek.getFullYear()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={goToPreviousWeek}
                className="bg-white/70 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                ← Önceki
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={goToCurrentWeek}
                className="bg-white/70 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Bu Hafta
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={goToNextWeek}
                className="bg-white/70 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Sonraki →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Desktop View - 7 columns */}
          <div className="hidden lg:grid grid-cols-7 gap-4">
            {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="bg-white/70 rounded-lg p-3 mb-2">
                  <div className="text-sm font-semibold text-indigo-800">{day}</div>
                </div>
              </div>
            ))}
            {getWeekDays().map((day, index) => {
              const dayTasks = getTasksForDay(day)
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
                      dayTasks.map((task: any, taskIndex: number) => (
                        <div
                          key={taskIndex}
                          className="group cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-105 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
                          onClick={() => {
                            // Task detail modal açılabilir
                          }}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getTaskTypeIcon(task.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-indigo-800 truncate">
                                {task.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {task.subject?.name || 'Ders seçilmedi'}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-700">
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

          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="space-y-4">
              {getWeekDays().map((day, index) => {
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
                        dayTasks.map((task: any, taskIndex: number) => (
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
                              // Task detail modal açılabilir
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

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-orange-600" />
            Görev Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedStudent ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🎓</div>
              <p className="text-gray-500 text-lg mb-2">Öğrenci Seçin</p>
              <p className="text-sm text-gray-400">Görevleri görüntülemek için navbar'dan bir öğrenci seçin</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-2">Henüz görev eklenmemiş</p>
              <p className="text-sm text-gray-400">İlk görevinizi eklemek için "Yeni Görev Ekle" butonuna tıklayın</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{task.description}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.type === 'konu_anlatimi' 
                            ? 'bg-blue-100 text-blue-800'
                            : task.type === 'soru_cozumu'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {task.type === 'konu_anlatimi' ? 'Konu Anlatımı' : 
                           task.type === 'soru_cozumu' ? 'Soru Çözümü' : 
                           task.type === 'deneme' ? 'Deneme' : 'Diğer'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(task.endDate).toLocaleDateString('tr-TR')} {task.endTime}
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {task.subject?.name || 'Ders'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tamamlanan Görevler Tablosu */}
      {selectedStudent && completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Tamamlanan Görevler
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName} tarafından tamamlanan görevler
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Görev</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tür</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ders</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kaynak</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Bitiş Tarihi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tamamlanma</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Test Sonucu</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTasks.map((task: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTaskTypeIcon(task.type)}
                          <div>
                            <p className="font-medium text-gray-900">{task.description}</p>
                            {task.completionNote && (
                              <p className="text-xs text-gray-500 mt-1">{task.completionNote}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {getTaskTypeText(task.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">{task.subject?.name || 'Bilinmeyen'}</p>
                          <p className="text-xs text-gray-500">{task.subject?.class?.name || 'Bilinmeyen Sınıf'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{task.resourceName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700">
                          <p>{new Date(task.endDate).toLocaleDateString('tr-TR')}</p>
                          <p className="text-xs text-gray-500">{task.endTime}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700">
                          <p>{task.completedAt ? new Date(task.completedAt).toLocaleDateString('tr-TR') : '-'}</p>
                          <p className="text-xs text-gray-500">
                            {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {task.status === 'completed' ? 'Tamamlandı' : 'Gecikmiş'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {task.type === 'soru_cozumu' && task.correctAnswers !== null ? (
                          <div className="text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 font-medium">✓ {task.correctAnswers}</span>
                              <span className="text-red-600">✗ {task.wrongAnswers}</span>
                              <span className="text-gray-600">○ {task.blankAnswers}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Net: {task.totalScore} puan
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Görev Ekleme Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={handleCancelTask}
        title="Yeni Görev Ekle"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Seçili Öğrenci Bilgisi */}
          {selectedStudent && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👨‍🎓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName}
                  </p>
                  <p className="text-xs text-orange-600">
                    Bu öğrenciye görev atanacak
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Görev Türü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görev Türü *
            </label>
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({...newTask, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="konu_anlatimi">Konu Anlatımı</option>
              <option value="konu_anlatimi_video">Konu Anlatımı (Video)</option>
              <option value="soru_cozumu">Soru Çözümü</option>
              <option value="deneme">Deneme</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          {/* Kaynak Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaynak Adı *
            </label>
            <input
              type="text"
              value={newTask.resourceName}
              onChange={(e) => setNewTask({...newTask, resourceName: e.target.value})}
              placeholder="Örn: Matematik Kitabı, Video Serisi, Test Bankası"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Dinamik Alanlar - Konu Anlatımı */}
          {newTask.type === 'konu_anlatimi' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sayfa Başı *
                </label>
                <input
                  type="number"
                  value={newTask.pageStart}
                  onChange={(e) => setNewTask({...newTask, pageStart: e.target.value})}
                  placeholder="Örn: 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sayfa Sonu *
                </label>
                <input
                  type="number"
                  value={newTask.pageEnd}
                  onChange={(e) => setNewTask({...newTask, pageEnd: e.target.value})}
                  placeholder="Örn: 67"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Dinamik Alanlar - Konu Anlatımı (Video) */}
          {newTask.type === 'konu_anlatimi_video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Sayısı *
              </label>
              <input
                type="number"
                value={newTask.videoCount}
                onChange={(e) => setNewTask({...newTask, videoCount: e.target.value})}
                placeholder="Örn: 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Dinamik Alanlar - Soru Çözümü */}
          {newTask.type === 'soru_cozumu' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Sayısı *
              </label>
              <input
                type="number"
                value={newTask.testCount}
                onChange={(e) => setNewTask({...newTask, testCount: e.target.value})}
                placeholder="Örn: 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Görev Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görev Tarihi *
            </label>
            <input
              type="date"
              value={newTask.taskDate}
              onChange={(e) => handleTaskDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bu tarih görevin yapılacağı gündür. Başlangıç (00:00) ve bitiş (23:59) tarihleri otomatik hesaplanır.
            </p>
          </div>

          {/* Başlangıç Tarihi ve Saati */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={!!newTask.taskDate}
              />
              {newTask.taskDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Görev tarihi seçildiği için otomatik hesaplandı
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={newTask.startTime}
                onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bitiş Tarihi ve Saati */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi *
              </label>
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={!!newTask.taskDate}
              />
              {newTask.taskDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Görev tarihi seçildiği için otomatik hesaplandı
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={newTask.endTime}
                onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ders Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ders *
            </label>
            <select
              value={newTask.subject}
              onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Ders seçin</option>
              {studentSubjects.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.className} - {subject.name}
                </option>
              ))}
            </select>
            {studentSubjects.length === 0 && selectedStudent && (
              <p className="text-sm text-orange-600 mt-1">
                Bu öğrenciye henüz ders atanmamış. Önce "Dersler" sayfasından ders atayın.
              </p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="Görev detaylarını, özel notları veya ek açıklamaları yazın..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Özet */}
          {newTask.startDate && newTask.endDate && newTask.resourceName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Görev Özeti:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• <strong>Tür:</strong> {
                  newTask.type === 'konu_anlatimi' ? 'Konu Anlatımı' :
                  newTask.type === 'konu_anlatimi_video' ? 'Konu Anlatımı (Video)' :
                  newTask.type === 'soru_cozumu' ? 'Soru Çözümü' :
                  newTask.type === 'deneme' ? 'Deneme' : 'Diğer'
                }</p>
                <p>• <strong>Kaynak:</strong> {newTask.resourceName}</p>
                {newTask.type === 'konu_anlatimi' && newTask.pageStart && newTask.pageEnd && (
                  <p>• <strong>Sayfalar:</strong> {newTask.pageStart} - {newTask.pageEnd}</p>
                )}
                {newTask.type === 'konu_anlatimi_video' && newTask.videoCount && (
                  <p>• <strong>Video Sayısı:</strong> {newTask.videoCount}</p>
                )}
                {newTask.type === 'soru_cozumu' && newTask.testCount && (
                  <p>• <strong>Test Sayısı:</strong> {newTask.testCount}</p>
                )}
                <p>• <strong>Başlangıç:</strong> {new Date(newTask.startDate).toLocaleDateString('tr-TR')} {newTask.startTime && `- ${newTask.startTime}`}</p>
                <p>• <strong>Bitiş:</strong> {new Date(newTask.endDate).toLocaleDateString('tr-TR')} {newTask.endTime && `- ${newTask.endTime}`}</p>
                {newTask.subject && (
                  <p>• <strong>Ders:</strong> {studentSubjects.find((s: any) => s.id === newTask.subject)?.className} - {studentSubjects.find((s: any) => s.id === newTask.subject)?.name}</p>
                )}
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelTask}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveTask}
              disabled={isSubmitting || !newTask.startDate || !newTask.endDate || !newTask.resourceName || !newTask.subject}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Ekleniyor...' : 'Görevi Ekle'}
            </Button>
          </div>
        </div>
      </Modal>
    </TeacherLayout>
  )
}