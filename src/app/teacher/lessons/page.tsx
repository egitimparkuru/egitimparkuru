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
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Stop,
  BookOpen,
  GraduationCap
} from 'lucide-react'

export default function LessonsPage() {
  const [lessons, setLessons] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSubjects: 0,
    completedSubjects: 0,
    inProgressSubjects: 0,
    totalTopics: 0,
    completedTopics: 0
  })
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showTopicsModal, setShowTopicsModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [classes, setClasses] = useState([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  
  // Manuel ders atama states
  const [customClass, setCustomClass] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customTopics, setCustomTopics] = useState<string[]>([''])
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    loadStudents()
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadLessons()
    } else {
      setLessons([])
      setStats({
        totalSubjects: 0,
        completedSubjects: 0,
        inProgressSubjects: 0,
        totalTopics: 0,
        completedTopics: 0
      })
    }
  }, [selectedStudent])

  const loadLessons = async () => {
    if (!selectedStudent) return

    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teacher/student-subjects?studentId=${selectedStudent}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setLessons(data.data.studentSubjects)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Lessons load error:', error)
    } finally {
      setLoading(false)
    }
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

  const loadClasses = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const response = await fetch('/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setClasses(data.data)
      }
    } catch (error) {
      console.error('Classes load error:', error)
    }
  }

  const handleAssignSubjects = async () => {
    if (!selectedStudent || selectedSubjects.length === 0) {
      alert('Lütfen öğrenci ve en az bir ders seçin')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Her seçili ders için ayrı ayrı atama yap
      const promises = selectedSubjects.map(subjectId => 
        fetch('/api/teacher/assign-subject', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: selectedStudent,
            subjectId: subjectId
          })
        })
      )

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount

      if (successCount > 0) {
        alert(`${successCount} ders başarıyla atandı!${errorCount > 0 ? ` ${errorCount} ders atanamadı.` : ''}`)
        setShowAssignModal(false)
        setSelectedClasses([])
        setSelectedSubjects([])
        setSelectedTopics([])
        loadLessons() // Dersleri yeniden yükle
      } else {
        alert('Hiçbir ders atanamadı. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Assign subjects error:', error)
      alert('Dersler atanırken hata oluştu')
    }
  }

  const handleViewTopics = (lesson: any) => {
    setSelectedLesson(lesson)
    setShowTopicsModal(true)
  }

  const handleCompleteAllTopics = async (lesson: any) => {
    if (!confirm('Tüm konuları tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const promises = lesson.subject.topics.map((topic: any) => 
        fetch('/api/teacher/complete-topic', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: selectedStudent,
            topicId: topic.id
          })
        })
      )

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))
      
      const successCount = results.filter(r => r.success).length

      if (successCount > 0) {
        alert(`${successCount} konu tamamlandı olarak işaretlendi!`)
        loadLessons() // Dersleri yeniden yükle
      } else {
        alert('Konular tamamlanırken hata oluştu.')
      }
    } catch (error) {
      console.error('Complete topics error:', error)
      alert('Konular tamamlanırken hata oluştu')
    }
  }

  const handleCompleteTopic = async (topicId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/teacher/complete-topic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          topicId: topicId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Konu tamamlandı olarak işaretlendi!')
        loadLessons() // Dersleri yeniden yükle
        setShowTopicsModal(false) // Modal'ı kapat
      } else {
        alert('Konu tamamlanırken hata oluştu.')
      }
    } catch (error) {
      console.error('Complete topic error:', error)
      alert('Konu tamamlanırken hata oluştu')
    }
  }

  const handleDeleteSubject = async (lesson: any) => {
    const subjectName = lesson.subject.name
    const className = lesson.subject.class.name
    
    if (!confirm(`${className}. Sınıf ${subjectName} dersini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve tüm konu ilerlemeleri silinecektir.`)) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/teacher/delete-subject', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId: lesson.subject.id
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`${subjectName} dersi başarıyla silindi!`)
        loadLessons() // Dersleri yeniden yükle
      } else {
        alert('Ders silinirken hata oluştu.')
      }
    } catch (error) {
      console.error('Delete subject error:', error)
      alert('Ders silinirken hata oluştu')
    }
  }

  const handleDeleteClass = async (classLevel: string, classLessons: any[]) => {
    const className = classLessons[0].subject.class.name
    const subjectCount = classLessons.length
    
    if (!confirm(`${className}. Sınıfı tamamen silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve:\n• ${subjectCount} ders silinecek\n• Tüm konu ilerlemeleri silinecek\n• Tüm veriler kaybolacak`)) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Tüm dersleri tek tek sil
      const promises = classLessons.map(lesson => 
        fetch('/api/teacher/delete-subject', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: selectedStudent,
            subjectId: lesson.subject.id
          })
        })
      )

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))
      
      const successCount = results.filter(r => r.success).length

      if (successCount > 0) {
        alert(`${className}. Sınıf başarıyla silindi! ${successCount} ders silindi.`)
        loadLessons() // Dersleri yeniden yükle
      } else {
        alert('Sınıf silinirken hata oluştu.')
      }
    } catch (error) {
      console.error('Delete class error:', error)
      alert('Sınıf silinirken hata oluştu')
    }
  }

  const handleManualAssignment = async () => {
    if (!selectedStudent || !customClass || !customSubject || customTopics.length === 0) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/teacher/manual-assignment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          className: customClass,
          subjectName: customSubject,
          topics: customTopics.filter(topic => topic.trim() !== '')
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Manuel ders başarıyla atandı!')
        setShowManualModal(false)
        setCustomClass('')
        setCustomSubject('')
        setCustomTopics([''])
        setNewTopic('')
        loadLessons() // Dersleri yeniden yükle
      } else {
        alert('Manuel ders atanırken hata oluştu.')
      }
    } catch (error) {
      console.error('Manual assignment error:', error)
      alert('Manuel ders atanırken hata oluştu')
    }
  }

  const addCustomTopic = () => {
    if (newTopic.trim() !== '') {
      setCustomTopics([...customTopics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const removeCustomTopic = (index: number) => {
    setCustomTopics(customTopics.filter((_, i) => i !== index))
  }

  return (
    <TeacherLayout
      title="Dersler"
      description="Öğrencilerinizle yaptığınız dersleri yönetin"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >

        {/* Selected Student Info Card */}
        {selectedStudent && (
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍🎓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">
                    {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName} için Ders Yönetimi
                  </h3>
                  <p className="text-sm text-indigo-600">
                    {students.find((s: any) => s.id === selectedStudent)?.grade ? 
                      `${students.find((s: any) => s.id === selectedStudent)?.grade}. Sınıf öğrencisi` : 
                      'Sınıf bilgisi belirtilmemiş'
                    } • Dersleri görüntülüyor ve yönetiyorsunuz
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Toplam Ders</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Tamamlanan</p>
                  <p className="text-3xl font-bold text-green-900">{stats.completedSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Devam Eden</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.inProgressSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Toplam Konu</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.totalTopics}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Ders Listesi</h2>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setShowManualModal(true)}
              disabled={!selectedStudent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manuel Ders Atama
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowAssignModal(true)}
              disabled={!selectedStudent}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Öğrencinize Ders Atayın
            </Button>
          </div>
        </div>

        {/* Lessons List - Grouped by Class */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Dersler yükleniyor...</p>
              </div>
            ) : !selectedStudent ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍🎓</div>
                <p className="text-gray-500 text-lg mb-2">Öğrenci Seçin</p>
                <p className="text-sm text-gray-400">Dersleri görüntülemek için navbar'dan bir öğrenci seçin</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg mb-2">Henüz ders atanmamış</p>
                <p className="text-sm text-gray-400">Bu öğrenciye ders atamak için "Öğrencinize Ders Atayın" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Dersleri sınıfa göre grupla ve sırala
                  const groupedLessons = lessons.reduce((acc: any, lesson: any) => {
                    const classLevel = lesson.subject.class.level
                    if (!acc[classLevel]) {
                      acc[classLevel] = []
                    }
                    acc[classLevel].push(lesson)
                    return acc
                  }, {})

                  // Sınıfları küçükten büyüğe sırala
                  const sortedClasses = Object.keys(groupedLessons).sort((a, b) => parseInt(a) - parseInt(b))

                  return sortedClasses.map(classLevel => {
                    const classLessons = groupedLessons[classLevel]
                    const classInfo = classLessons[0].subject.class
                    
                    return (
                      <div key={classLevel} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Sınıf Başlığı */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{classInfo.name}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-blue-900">{classInfo.name}. Sınıf</h3>
                                <p className="text-sm text-blue-600">{classLessons.length} ders atanmış</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-blue-600">
                                  Toplam {classLessons.reduce((total: number, lesson: any) => 
                                    total + lesson.subject.topics.length, 0
                                  )} konu
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClass(classLevel, classLessons)}
                                className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Sınıfı Sil
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Dersler Tablosu */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ders
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  İlerleme
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Konular
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Durum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  İşlemler
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {classLessons.map((lesson: any) => {
                                const subject = lesson.subject
                                const topics = subject.topics
                                const completedTopics = topics.filter((topic: any) => 
                                  topic.studentProgress.length > 0 && 
                                  topic.studentProgress[0].status === 'completed'
                                ).length
                                const progressPercentage = topics.length > 0 ? (completedTopics / topics.length) * 100 : 0
                                const isCompleted = progressPercentage === 100
                                
                                return (
                                  <tr key={lesson.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                                          <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">%{Math.round(progressPercentage)}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-600">
                                        {completedTopics}/{topics.length} tamamlandı
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        isCompleted 
                                          ? 'bg-green-100 text-green-800' 
                                          : completedTopics > 0 
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {isCompleted ? 'Tamamlandı' : completedTopics > 0 ? 'Devam Ediyor' : 'Başlanmadı'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleViewTopics(lesson)}
                                          className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400"
                                        >
                                          <BookOpen className="h-4 w-4 mr-1" />
                                          Konuları Görüntüle
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCompleteAllTopics(lesson)}
                                          disabled={isCompleted}
                                          className="text-green-600 hover:text-green-800 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Tümünü Tamamla
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteSubject(lesson)}
                                          className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Sil
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manuel Ders Atama Modal */}
        <Modal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          title="Manuel Ders Atama"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Seçili Öğrenci Bilgisi */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">👨‍🎓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName}
                    </p>
                    <p className="text-xs text-blue-600">
                      {students.find((s: any) => s.id === selectedStudent)?.grade ? 
                        `${students.find((s: any) => s.id === selectedStudent)?.grade}. Sınıf` : 
                        'Sınıf belirtilmemiş'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!selectedStudent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Öğrenci Seçimi Gerekli
                    </p>
                    <p className="text-xs text-yellow-600">
                      Manuel ders atamak için önce navbar'dan bir öğrenci seçin
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sınıf Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sınıf Adı *
              </label>
              <input
                type="text"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="Örn: 35. Sınıf, Özel Sınıf, Hazırlık Sınıfı"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ders Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ders Adı *
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Örn: Aaa Dersi, Özel Matematik, İngilizce Konuşma"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Konular */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konular *
              </label>
              <div className="space-y-2">
                {customTopics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [...customTopics]
                        newTopics[index] = e.target.value
                        setCustomTopics(newTopics)
                      }}
                      placeholder={`Konu ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {customTopics.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeCustomTopic(index)}
                        className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {/* Yeni Konu Ekleme */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Yeni konu ekle..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomTopic()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomTopic}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Özet */}
            {customClass && customSubject && customTopics.filter(t => t.trim() !== '').length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Atama Özeti:</h4>
                <div className="text-sm text-green-700">
                  <p>• <strong>Sınıf:</strong> {customClass}</p>
                  <p>• <strong>Ders:</strong> {customSubject}</p>
                  <p>• <strong>Konular:</strong> {customTopics.filter(t => t.trim() !== '').length} adet</p>
                  <ul className="ml-4 mt-1">
                    {customTopics.filter(t => t.trim() !== '').map((topic, index) => (
                      <li key={index}>- {topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowManualModal(false)
                  setCustomClass('')
                  setCustomSubject('')
                  setCustomTopics([''])
                  setNewTopic('')
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button
                onClick={handleManualAssignment}
                disabled={!selectedStudent || !customClass || !customSubject || customTopics.filter(t => t.trim() !== '').length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Dersi Ata
              </Button>
            </div>
          </div>
        </Modal>

        {/* Topics Management Modal */}
        <Modal
          isOpen={showTopicsModal}
          onClose={() => setShowTopicsModal(false)}
          title={selectedLesson ? `${selectedLesson.subject.name} - Konu Yönetimi` : 'Konu Yönetimi'}
        >
          {selectedLesson && (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Ders Bilgisi */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">{selectedLesson.subject.class.name}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{selectedLesson.subject.name}</h3>
                      <p className="text-sm text-blue-600">{selectedLesson.subject.class.name}. Sınıf</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600">
                      {selectedLesson.subject.topics.filter((topic: any) => 
                        topic.studentProgress.length > 0 && 
                        topic.studentProgress[0].status === 'completed'
                      ).length}/{selectedLesson.subject.topics.length} konu tamamlandı
                    </div>
                  </div>
                </div>
              </div>

              {/* Konular Listesi */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Konular:</h4>
                {selectedLesson.subject.topics.map((topic: any, index: number) => {
                  const isCompleted = topic.studentProgress.length > 0 && 
                    topic.studentProgress[0].status === 'completed'
                  
                  return (
                    <div 
                      key={topic.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h5 className={`font-medium ${
                            isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {topic.name}
                          </h5>
                          <p className={`text-sm ${
                            isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {isCompleted ? 'Tamamlandı' : 'Beklemede'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!isCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTopic(topic.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Tamamla
                          </Button>
                        )}
                        {isCompleted && (
                          <span className="text-green-600 text-sm font-medium">
                            ✓ Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Toplu İşlemler */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {selectedLesson.subject.topics.filter((topic: any) => 
                    topic.studentProgress.length > 0 && 
                    topic.studentProgress[0].status === 'completed'
                  ).length}/{selectedLesson.subject.topics.length} konu tamamlandı
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTopicsModal(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Kapat
                  </Button>
                  {selectedLesson.subject.topics.filter((topic: any) => 
                    topic.studentProgress.length > 0 && 
                    topic.studentProgress[0].status === 'completed'
                  ).length < selectedLesson.subject.topics.length && (
                    <Button
                      onClick={() => handleCompleteAllTopics(selectedLesson)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Tümünü Tamamla
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Assign Subject Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Öğrencinize Ders Atayın"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Seçili Öğrenci Bilgisi */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">👨‍🎓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {students.find((s: any) => s.id === selectedStudent)?.user?.firstName} {students.find((s: any) => s.id === selectedStudent)?.user?.lastName}
                    </p>
                    <p className="text-xs text-blue-600">
                      {students.find((s: any) => s.id === selectedStudent)?.grade ? 
                        `${students.find((s: any) => s.id === selectedStudent)?.grade}. Sınıf` : 
                        'Sınıf belirtilmemiş'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!selectedStudent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Öğrenci Seçimi Gerekli
                    </p>
                    <p className="text-xs text-yellow-600">
                      Ders atamak için önce navbar'dan bir öğrenci seçin
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sınıf Seçimi - Çoklu */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Sınıfları Seçin (Birden fazla seçebilirsiniz)
                </label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allClassIds = classes.map((c: any) => c.id)
                      setSelectedClasses(allClassIds)
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Tümünü Seç
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClasses([])
                      setSelectedSubjects([])
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Tümünü Kaldır
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                {classes.map((classItem: any) => (
                  <label key={classItem.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(classItem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClasses([...selectedClasses, classItem.id])
                        } else {
                          setSelectedClasses(selectedClasses.filter(id => id !== classItem.id))
                          // Sınıf kaldırıldığında o sınıfa ait dersleri de kaldır
                          const classSubjects = classItem.subjects.map((s: any) => s.id)
                          setSelectedSubjects(selectedSubjects.filter(id => !classSubjects.includes(id)))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{classItem.name}. Sınıf</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ders Seçimi - Çoklu */}
            {selectedClasses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Dersleri Seçin (Birden fazla seçebilirsiniz)
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allSubjectIds = selectedClasses
                          .flatMap((classId: string) => {
                            const classItem = classes.find((c: any) => c.id === classId)
                            return classItem?.subjects.map((s: any) => s.id) || []
                          })
                        setSelectedSubjects(allSubjectIds)
                      }}
                      className="text-xs px-2 py-1 h-6"
                    >
                      Tümünü Seç
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubjects([])
                        setSelectedTopics([])
                      }}
                      className="text-xs px-2 py-1 h-6"
                    >
                      Tümünü Kaldır
                    </Button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
                  {selectedClasses.map((classId: string) => {
                    const classItem = classes.find((c: any) => c.id === classId)
                    return (
                      <div key={classId} className="border-b border-gray-200 pb-2 last:border-b-0">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">
                          {classItem?.name}. Sınıf Dersleri:
                        </h4>
                        <div className="grid grid-cols-1 gap-1 ml-4">
                          {classItem?.subjects.map((subject: any) => (
                            <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubjects([...selectedSubjects, subject.id])
                                  } else {
                                    setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id))
                                    // Ders kaldırıldığında o derse ait konuları da kaldır
                                    const subjectTopics = subject.topics.map((t: any) => t.id)
                                    setSelectedTopics(selectedTopics.filter(id => !subjectTopics.includes(id)))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {subject.name} ({subject.topics.length} konu)
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Seçim Özeti */}
            {selectedSubjects.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Seçim Özeti:</h4>
                <div className="text-sm text-green-700">
                  <p>• {selectedClasses.length} sınıf seçildi</p>
                  <p>• {selectedSubjects.length} ders seçildi</p>
                  <p>• Toplam {selectedSubjects.reduce((total, subjectId) => {
                    const subject = classes
                      .flatMap((c: any) => c.subjects)
                      .find((s: any) => s.id === subjectId)
                    return total + (subject?.topics.length || 0)
                  }, 0)} konu atanacak</p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedClasses([])
                  setSelectedSubjects([])
                  setSelectedTopics([])
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button
                onClick={handleAssignSubjects}
                disabled={!selectedStudent || selectedSubjects.length === 0}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Dersleri Ata ({selectedSubjects.length})
              </Button>
            </div>
          </div>
        </Modal>
    </TeacherLayout>
  )
}
