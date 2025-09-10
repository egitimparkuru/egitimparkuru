'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
    loadStudents()
  }, [])

  const loadEvents = async () => {
    // TODO: API endpoint'i oluşturulacak
    setLoading(false)
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Önceki ayın günleri
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({ date: currentDate, isCurrentMonth: true })
    }
    
    // Sonraki ayın günleri (takvimi tamamlamak için)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <TeacherLayout
      title="Takvim"
      description="Derslerinizi ve etkinliklerinizi takip edin"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >
      {/* Calendar Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            onClick={goToToday}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Bugün
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={goToNextMonth}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Etkinlik Ekle
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                className={`p-2 h-24 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                } ${
                  day.date.toDateString() === new Date().toDateString() 
                    ? 'bg-blue-100 border-blue-300' 
                    : ''
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {/* Events will be rendered here */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Yaklaşan Etkinlikler
            </CardTitle>
            <CardDescription>
              Bu hafta planlanan dersler ve etkinlikler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-500 text-lg mb-2">Yaklaşan etkinlik yok</p>
              <p className="text-sm text-gray-400">Yeni etkinlik eklemek için "Etkinlik Ekle" butonunu kullanın</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}