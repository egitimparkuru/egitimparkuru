'use client'

import { useState, useEffect } from 'react'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorToast, SuccessToast } from '@/components/ui/ErrorToast'
import { SkeletonCard, SkeletonStats, LoadingSpinner } from '@/components/ui/Skeleton'
import { useApi, useMutation } from '@/hooks/useApi'
import { useFormValidation } from '@/hooks/useFormValidation'
import { createRoutineTaskSchema, CreateRoutineTaskInput } from '@/lib/validations'
import { RoutineTask } from '@/lib/types'

// Remove duplicate interface - using imported type

export default function RoutineTasks() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<RoutineTask | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [toastError, setToastError] = useState<string | null>(null)
  const [toastSuccess, setToastSuccess] = useState<string | null>(null)

  const [newTask, setNewTask] = useState<CreateRoutineTaskInput & { selectedDays: number[] }>({
    name: '',
    description: '',
    type: 'konu_anlatimi',
    subjectId: '',
    time: '',
    frequency: 'weekly',
    studentIds: [],
    selectedDays: []
  })

  // Form validation
  const validation = useFormValidation(createRoutineTaskSchema)

  // Load data on component mount
  useEffect(() => {
    loadRoutineTasks()
    loadStudents()
    loadSubjects()
  }, [])

  // API hooks
  const { data: routineTasks, loading: tasksLoading, error: tasksError, execute: loadRoutineTasks } = useApi<RoutineTask[]>(
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teacher/routine-tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load routine tasks')
      const data = await response.json()
      return data.data || []
    },
    { 
      immediate: false,
      cacheKey: 'routine-tasks',
      cacheTime: 2 * 60 * 1000 // 2 minutes
    }
  )

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
      cacheTime: 5 * 60 * 1000 // 5 minutes
    }
  )

  const { data: subjects, loading: subjectsLoading, execute: loadSubjects } = useApi(
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teacher/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load subjects')
      const data = await response.json()
      const allSubjects = data.data.flatMap((cls: any) =>
        cls.subjects.map((subject: any) => ({
          ...subject,
          className: cls.name,
          classLevel: cls.level
        }))
      )
      return allSubjects
    },
    { 
      immediate: false,
      cacheKey: 'subjects',
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  )

  const createTaskMutation = useMutation(
    async (taskData: CreateRoutineTaskInput) => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teacher/routine-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      })
      if (!response.ok) throw new Error('Failed to create routine task')
      const data = await response.json()
      return data.data
    },
    {
      onSuccess: () => {
        setToastSuccess('Rutin görev başarıyla oluşturuldu!')
        setShowCreateModal(false)
        resetForm()
        loadRoutineTasks()
      },
      onError: (error) => {
        setToastError(error.message || 'Rutin görev oluşturulurken hata oluştu')
      }
    }
  )

  const taskTypes = [
    { value: 'konu_anlatimi', label: 'Konu Anlatımı' },
    { value: 'konu_anlatimi_video', label: 'Konu Anlatımı (Video)' },
    { value: 'soru_cozumu', label: 'Soru Çözümü' },
    { value: 'deneme', label: 'Deneme' },
    { value: 'diger', label: 'Diğer' }
  ]

  const days = [
    { value: 0, label: 'Pazar' },
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' }
  ]

  const handleCreateTask = async () => {
    if (!validation.validateForm(newTask)) {
      return
    }

    if (newTask.selectedDays.length === 0) {
      setToastError('En az bir gün seçmelisiniz')
      return
    }

    // Her seçili gün için ayrı rutin görev oluştur
    const promises = newTask.selectedDays.map((dayOfWeek: number) => 
      createTaskMutation.mutate({
        ...newTask,
        dayOfWeek,
        frequency: 'weekly'
      })
    )

    await Promise.all(promises)
  }

  const handleToggleActive = async (task: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/teacher/routine-tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !task.isActive
        })
      })

      if (response.ok) {
        loadRoutineTasks()
      }
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  const handleDeleteTask = async (task: any) => {
    if (!confirm('Bu rutin görevi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/teacher/routine-tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        loadRoutineTasks()
      }
    } catch (error) {
      console.error('Delete task error:', error)
    }
  }

  const resetForm = () => {
    setNewTask({
      name: '',
      description: '',
      type: 'konu_anlatimi',
      subjectId: '',
      time: '',
      frequency: 'weekly',
      studentIds: [],
      selectedDays: []
    })
    validation.clearErrors()
  }

  const getTypeText = (type: string) => {
    const taskType = taskTypes.find(t => t.value === type)
    return taskType ? taskType.label : type
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

  // Rutin görevleri grupla (aynı isimdeki görevleri birleştir)
  const groupedRoutineTasks = (routineTasks || []).reduce((acc: any, task: any) => {
    const key = task.name
    if (!acc[key]) {
      acc[key] = {
        ...task,
        days: []
      }
    }
    acc[key].days.push({
      dayOfWeek: task.dayOfWeek,
      dayName: days.find(d => d.value === task.dayOfWeek)?.label || 'Bilinmeyen'
    })
    return acc
  }, {})

  const groupedTasksArray = Object.values(groupedRoutineTasks)
  const activeTasks = groupedTasksArray.filter((task: any) => task.isActive).length
  const inactiveTasks = groupedTasksArray.filter((task: any) => !task.isActive).length

  const loading = tasksLoading || studentsLoading || subjectsLoading

  return (
    <ErrorBoundary>
      <TeacherLayout 
        title="Rutin Görevler" 
        description="Tekrarlayan görev şablonlarınızı yönetin"
        showStudentSelector={true}
        selectedStudent={selectedStudent}
        onStudentChange={setSelectedStudent}
        students={students || []}
      >
        <div className="space-y-6">
          {/* İstatistik Kartları */}
          {loading ? (
            <SkeletonStats />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Toplam Rutin Görev</p>
                      <p className="text-2xl font-bold text-blue-900">{groupedTasksArray.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🔄</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Aktif Görevler</p>
                      <p className="text-2xl font-bold text-green-900">{activeTasks}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">✅</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pasif Görevler</p>
                      <p className="text-2xl font-bold text-gray-900">{inactiveTasks}</p>
                    </div>
                    <div className="h-12 w-12 bg-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">⏸️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        {/* Yeni Rutin Görev Oluştur Butonu */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            + Yeni Rutin Görev Oluştur
          </Button>
        </div>

        {/* Rutin Görevler Listesi */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : tasksError ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
                <p className="text-gray-600 mb-4">{tasksError.message}</p>
                <Button onClick={() => loadRoutineTasks()} variant="outline">
                  Tekrar Dene
                </Button>
              </CardContent>
            </Card>
          ) : groupedTasksArray.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz rutin görev yok</h3>
                <p className="text-gray-600 mb-4">İlk rutin görevinizi oluşturmak için yukarıdaki butona tıklayın.</p>
              </CardContent>
            </Card>
          ) : (
            groupedTasksArray.map((task: any) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{task.name}</CardTitle>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleToggleActive(task)}
                        size="sm"
                        variant="outline"
                        className={task.isActive ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}
                      >
                        {task.isActive ? 'Aktif' : 'Pasif'}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedTask(task)
                          setShowEditModal(true)
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Düzenle
                      </Button>
                      <Button
                        onClick={() => handleDeleteTask(task)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tür:</span>
                      <span className="text-sm font-medium">{getTypeText(task.type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Günler:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.days.map((day: any, index: number) => (
                          <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {day.dayName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Saat:</span>
                      <span className="text-sm font-medium">{task.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ders:</span>
                      <span className="text-sm font-medium">{task.subject?.name || 'Ders seçilmedi'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Öğrenci Sayısı:</span>
                      <span className="text-sm font-medium">{task.students.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Yeni Rutin Görev Oluştur Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Yeni Rutin Görev Oluştur"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görev Adı *
            </label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => {
                setNewTask({ ...newTask, name: e.target.value })
                validation.validateField('name', e.target.value)
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                validation.hasFieldError('name') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Örn: Matematik Konu Anlatımı"
            />
            {validation.hasFieldError('name') && (
              <p className="mt-1 text-sm text-red-600">{validation.getFieldError('name')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Görev hakkında detaylı bilgi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görev Türü *
            </label>
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {taskTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ders (Opsiyonel)
            </label>
            <select
              value={newTask.subjectId}
              onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Ders seçin (opsiyonel)</option>
              {(subjects || []).map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.className} - {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saat *
            </label>
            <input
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Haftanın Günleri *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <label key={day.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newTask.selectedDays.includes(day.value)}
                    onChange={(e) => {
                      const currentDays = newTask.selectedDays
                      if (e.target.checked) {
                        setNewTask({
                          ...newTask,
                          selectedDays: [...currentDays, day.value]
                        })
                      } else {
                        setNewTask({
                          ...newTask,
                          selectedDays: currentDays.filter((d: number) => d !== day.value)
                        })
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
              variant="outline"
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.name || !newTask.time || newTask.selectedDays.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Oluştur
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toastError && (
        <ErrorToast
          error={{ message: toastError }}
          onClose={() => setToastError(null)}
        />
      )}
      {toastSuccess && (
        <SuccessToast
          message={toastSuccess}
          onClose={() => setToastSuccess(null)}
        />
      )}
    </TeacherLayout>
    </ErrorBoundary>
  )
}