'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  LogOut,
  Menu,
  X,
  UserPlus,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Power,
  PowerOff,
  MoreVertical
} from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [showEditTeacher, setShowEditTeacher] = useState(false)
  const [showDeleteTeacher, setShowDeleteTeacher] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0]
  })
  const [editTeacherForm, setEditTeacherForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    hireDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  })
  const router = useRouter()

  const navigation = [
    { name: 'Genel Bakış', href: 'overview', icon: BarChart3 },
    { name: 'Öğretmen Yönetimi', href: 'teachers', icon: Users },
  ]

  useEffect(() => {
    checkAuth()
    loadTeachers()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.role === 'ADMIN') {
          setUser(data.data)
        } else {
          router.push('/auth/login')
        }
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadTeachers = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    
    try {
      const response = await fetch('/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setTeachers(data.data)
      }
    } catch (error) {
      console.error('Öğretmenler yüklenemedi:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...teacherForm,
          specialization: []
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setTeacherForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          hireDate: new Date().toISOString().split('T')[0]
        })
        setShowCreateTeacher(false)
        loadTeachers()
        alert('Öğretmen başarıyla oluşturuldu!')
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher)
    setEditTeacherForm({
      email: teacher.user.email,
      password: '',
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      phone: teacher.user.phone || '',
      hireDate: new Date(teacher.hireDate).toISOString().split('T')[0],
      status: teacher.user.status
    })
    setShowEditTeacher(true)
  }

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    
    try {
      const response = await fetch(`/api/admin/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editTeacherForm)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowEditTeacher(false)
        setSelectedTeacher(null)
        loadTeachers()
        alert('Öğretmen başarıyla güncellendi!')
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleDeleteTeacher = (teacher: any) => {
    setSelectedTeacher(teacher)
    setShowDeleteTeacher(true)
  }

  const confirmDeleteTeacher = async () => {
    const token = localStorage.getItem('accessToken')
    
    try {
      const response = await fetch(`/api/admin/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setShowDeleteTeacher(false)
        setSelectedTeacher(null)
        loadTeachers()
        alert('Öğretmen başarıyla silindi!')
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleToggleStatus = async (teacher: any) => {
    const token = localStorage.getItem('accessToken')
    const newStatus = teacher.user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        loadTeachers()
        alert(`Öğretmen ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı!`)
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-lg font-semibold">Admin Paneli</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.href as 'overview' | 'teachers')
                  setSidebarOpen(false)
                }}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === item.href
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-semibold">Admin Paneli</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.href as 'overview' | 'teachers')}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === item.href
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Admin Paneli</h1>
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-500">Sistem Yöneticisi</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Çıkış Yap"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👨‍🏫</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Toplam Öğretmen</p>
                          <p className="text-3xl font-bold text-blue-900">{teachers.length}</p>
                          <p className="text-xs text-blue-500">Eğitim Koçları</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👨‍🎓</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Toplam Öğrenci</p>
                          <p className="text-3xl font-bold text-green-900">0</p>
                          <p className="text-xs text-green-500">Kayıtlı Öğrenciler</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👨‍👩‍👧‍👦</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-600">Toplam Veli</p>
                          <p className="text-3xl font-bold text-purple-900">0</p>
                          <p className="text-xs text-purple-500">Kayıtlı Veliler</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Teachers */}
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <span className="text-2xl mr-3">📊</span>
                      Son Kayıt Olan Öğretmenler
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Platforma son eklenen öğretmen ve eğitim koçları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teachers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <p className="text-gray-500 text-lg mb-2">Henüz öğretmen kaydı yok</p>
                        <p className="text-sm text-gray-400">İlk öğretmeni eklemek için "Öğretmen Yönetimi" sekmesine geçin</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {teachers.slice(0, 5).map((teacher: any) => (
                          <div key={teacher.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                              <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍🏫</span>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-900">
                                  {teacher.user.firstName} {teacher.user.lastName}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <span className="mr-1">📧</span>
                                  {teacher.user.email}
                                </p>
                                {teacher.user.phone && (
                                  <p className="text-sm text-gray-500 flex items-center">
                                    <span className="mr-1">📞</span>
                                    {teacher.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 flex items-center">
                                <span className="mr-1">📅</span>
                                {new Date(teacher.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="text-xs text-green-600 font-medium mt-1 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Aktif
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'teachers' && (
              <div className="w-full">
                {/* Teachers List */}
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center text-gray-800">
                          <span className="text-2xl mr-3">👨‍🏫</span>
                          Öğretmenler & Eğitim Koçları
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Platforma kayıtlı öğretmen ve eğitim koçu listesi
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => setShowCreateTeacher(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                      >
                        <span className="text-lg mr-2">➕</span>
                        Yeni Öğretmen Ekle
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {teachers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <p className="text-gray-500 text-lg mb-2">Henüz öğretmen kaydı yok</p>
                        <p className="text-sm text-gray-400">İlk öğretmeni eklemek için "Yeni Öğretmen Ekle" butonuna tıklayın</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {teachers.map((teacher: any) => (
                          <div key={teacher.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                <div className="h-14 w-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-2xl">👨‍🏫</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-xl text-gray-900 mb-1">
                                    {teacher.user.firstName} {teacher.user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                                    <span className="mr-2">📧</span>
                                    {teacher.user.email}
                                  </div>
                                  {teacher.user.phone && (
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <span className="mr-2">📞</span>
                                      {teacher.user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right mr-4">
                                  <div className="text-sm text-gray-500 flex items-center justify-end mb-2">
                                    <span className="mr-1">📅</span>
                                    {new Date(teacher.createdAt).toLocaleDateString('tr-TR')}
                                  </div>
                                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    teacher.user.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${
                                      teacher.user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                    {teacher.user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <button
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(teacher)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      teacher.user.status === 'ACTIVE'
                                        ? 'text-orange-600 hover:bg-orange-50'
                                        : 'text-green-600 hover:bg-green-50'
                                    }`}
                                    title={teacher.user.status === 'ACTIVE' ? 'Pasif Yap' : 'Aktif Yap'}
                                  >
                                    {teacher.user.status === 'ACTIVE' ? (
                                      <PowerOff className="h-4 w-4" />
                                    ) : (
                                      <Power className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTeacher(teacher)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Edit Teacher Modal */}
            <Modal
              isOpen={showEditTeacher}
              onClose={() => setShowEditTeacher(false)}
              title="✏️ Öğretmen Düzenle"
              size="lg"
            >
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✏️</div>
                  <p className="text-gray-600">
                    Öğretmen bilgilerini düzenleyin
                  </p>
                </div>
                
                <form onSubmit={handleUpdateTeacher} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Ad"
                      name="firstName"
                      value={editTeacherForm.firstName}
                      onChange={(e) => setEditTeacherForm(prev => ({...prev, firstName: e.target.value}))}
                      required
                      placeholder="Öğretmen adı"
                    />
                    <Input
                      label="Soyad"
                      name="lastName"
                      value={editTeacherForm.lastName}
                      onChange={(e) => setEditTeacherForm(prev => ({...prev, lastName: e.target.value}))}
                      required
                      placeholder="Öğretmen soyadı"
                    />
                  </div>
                  
                  <Input
                    label="E-posta"
                    type="email"
                    name="email"
                    value={editTeacherForm.email}
                    onChange={(e) => setEditTeacherForm(prev => ({...prev, email: e.target.value}))}
                    required
                    placeholder="ornek@email.com"
                  />
                  
                  <Input
                    label="Yeni Şifre (boş bırakırsanız değişmez)"
                    type="password"
                    name="password"
                    value={editTeacherForm.password}
                    onChange={(e) => setEditTeacherForm(prev => ({...prev, password: e.target.value}))}
                    placeholder="Yeni şifre girin"
                  />
                  
                  <Input
                    label="Telefon"
                    name="phone"
                    value={editTeacherForm.phone}
                    onChange={(e) => setEditTeacherForm(prev => ({...prev, phone: e.target.value}))}
                    placeholder="0555 123 45 67"
                  />
                  
                  <Input
                    label="Kayıt Tarihi"
                    type="date"
                    name="hireDate"
                    value={editTeacherForm.hireDate}
                    onChange={(e) => setEditTeacherForm(prev => ({...prev, hireDate: e.target.value}))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum
                    </label>
                    <select
                      value={editTeacherForm.status}
                      onChange={(e) => setEditTeacherForm(prev => ({...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE'}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Pasif</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    >
                      <span className="text-lg mr-2">💾</span>
                      Değişiklikleri Kaydet
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEditTeacher(false)}
                      className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">❌</span>
                      İptal
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>

            {/* Delete Teacher Modal */}
            <Modal
              isOpen={showDeleteTeacher}
              onClose={() => setShowDeleteTeacher(false)}
              title="🗑️ Öğretmen Sil"
              size="md"
            >
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-gray-600 text-lg mb-2">
                    Bu öğretmeni silmek istediğinizden emin misiniz?
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>{selectedTeacher?.user?.firstName} {selectedTeacher?.user?.lastName}</strong> 
                    <br />
                    Bu işlem geri alınamaz!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={confirmDeleteTeacher}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                  >
                    <span className="text-lg mr-2">🗑️</span>
                    Evet, Sil
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteTeacher(false)}
                    className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="mr-2">❌</span>
                    İptal
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Create Teacher Modal */}
            <Modal
              isOpen={showCreateTeacher}
              onClose={() => setShowCreateTeacher(false)}
              title="👨‍🏫 Yeni Öğretmen/Eğitim Koçu Ekle"
              size="lg"
            >
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">👨‍🏫</div>
                  <p className="text-gray-600">
                    Platforma yeni öğretmen veya eğitim koçu ekleyin
                  </p>
                </div>
                
                <form onSubmit={handleCreateTeacher} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Ad"
                      name="firstName"
                      value={teacherForm.firstName}
                      onChange={(e) => setTeacherForm(prev => ({...prev, firstName: e.target.value}))}
                      required
                      placeholder="Öğretmen adı"
                    />
                    <Input
                      label="Soyad"
                      name="lastName"
                      value={teacherForm.lastName}
                      onChange={(e) => setTeacherForm(prev => ({...prev, lastName: e.target.value}))}
                      required
                      placeholder="Öğretmen soyadı"
                    />
                  </div>
                  
                  <Input
                    label="E-posta"
                    type="email"
                    name="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm(prev => ({...prev, email: e.target.value}))}
                    required
                    placeholder="ornek@email.com"
                  />
                  
                  <Input
                    label="Şifre"
                    type="password"
                    name="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm(prev => ({...prev, password: e.target.value}))}
                    required
                    placeholder="Güçlü bir şifre girin"
                  />
                  
                  <Input
                    label="Telefon"
                    name="phone"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm(prev => ({...prev, phone: e.target.value}))}
                    placeholder="0555 123 45 67"
                  />
                  
                  <Input
                    label="Kayıt Tarihi"
                    type="date"
                    name="hireDate"
                    value={teacherForm.hireDate}
                    onChange={(e) => setTeacherForm(prev => ({...prev, hireDate: e.target.value}))}
                    required
                  />
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    >
                      <span className="text-lg mr-2">👨‍🏫</span>
                      Öğretmen/Eğitim Koçu Ekle
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateTeacher(false)}
                      className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">❌</span>
                      İptal
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </main>
      </div>
    </div>
  )
}