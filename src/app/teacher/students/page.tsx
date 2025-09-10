'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Modal } from '@/components/ui/Modal'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  UserCheck,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Power,
  PowerOff
} from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('students')
  
  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showAddParentModal, setShowAddParentModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [showEditParentModal, setShowEditParentModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteType, setDeleteType] = useState('')

  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    registrationDate: '',
    grade: '',
    city: '',
    notes: ''
  })

  const [parentForm, setParentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    occupation: '',
    studentId: '',
    notes: ''
  })

  useEffect(() => {
    loadStudents()
    loadParents()
  }, [])

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

  const loadParents = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const response = await fetch('/api/teacher/parents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setParents(data.data)
      }
    } catch (error) {
      console.error('Parents load error:', error)
    }
  }

  const handleAddStudent = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowAddStudentModal(false)
        setStudentForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          registrationDate: '',
          grade: '',
          city: '',
          notes: ''
        })
        loadStudents() // Refresh the list
        alert('Öğrenci başarıyla eklendi!')
      } else {
        console.error('Student creation error:', data)
        alert(data.error || 'Öğrenci eklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Add student error:', error)
      alert('Öğrenci eklenirken bir hata oluştu')
    }
  }

  const handleAddParent = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/teacher/parents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parentForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowAddParentModal(false)
        setParentForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          occupation: '',
          studentId: '',
          notes: ''
        })
        loadParents() // Refresh the list
        alert('Veli başarıyla eklendi!')
      } else {
        alert(data.error || 'Veli eklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Add parent error:', error)
      alert('Veli eklenirken bir hata oluştu')
    }
  }

  const handleEditStudent = (student: any) => {
    setSelectedItem(student)
    setStudentForm({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      password: '', // Şifre düzenleme için boş bırak
      registrationDate: student.registrationDate || '',
      grade: student.grade || '',
      city: student.city || '',
      notes: student.notes || ''
    })
    setShowEditStudentModal(true)
  }

  const handleEditParent = (parent: any) => {
    setSelectedItem(parent)
    setParentForm({
      firstName: parent.user.firstName,
      lastName: parent.user.lastName,
      email: parent.user.email,
      password: '', // Şifre düzenleme için boş bırak
      occupation: parent.occupation || '',
      studentId: parent.studentId || '',
      notes: parent.notes || ''
    })
    setShowEditParentModal(true)
  }

  const handleUpdateParent = async () => {
    const token = localStorage.getItem('token')
    if (!token || !selectedItem) return

    try {
      const response = await fetch(`/api/teacher/parents/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parentForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowEditParentModal(false)
        setParentForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          occupation: '',
          studentId: '',
          notes: ''
        })
        setSelectedItem(null)
        loadParents() // Refresh the list
        alert('Veli başarıyla güncellendi!')
      } else {
        alert(data.error || 'Veli güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Update parent error:', error)
      alert('Veli güncellenirken bir hata oluştu')
    }
  }

  const handleUpdateStudent = async () => {
    const token = localStorage.getItem('token')
    if (!token || !selectedItem) return

    try {
      const response = await fetch(`/api/teacher/students/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowEditStudentModal(false)
        setStudentForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          registrationDate: '',
          grade: '',
          city: '',
          notes: ''
        })
        setSelectedItem(null)
        loadStudents() // Refresh the list
        alert('Öğrenci başarıyla güncellendi!')
      } else {
        alert(data.error || 'Öğrenci güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Update student error:', error)
      alert('Öğrenci güncellenirken bir hata oluştu')
    }
  }

  const handleDelete = (item: any, type: string) => {
    setSelectedItem(item)
    setDeleteType(type)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const endpoint = deleteType === 'student' ? 'students' : 'parents'
      const response = await fetch(`/api/teacher/${endpoint}/${selectedItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setShowDeleteModal(false)
        setSelectedItem(null)
        setDeleteType('')
        
        // Refresh the appropriate list
        if (deleteType === 'student') {
          loadStudents()
        } else {
          loadParents()
        }
        
        alert(`${deleteType === 'student' ? 'Öğrenci' : 'Veli'} başarıyla silindi!`)
      } else {
        alert(data.error || `${deleteType === 'student' ? 'Öğrenci' : 'Veli'} silinirken bir hata oluştu`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(`${deleteType === 'student' ? 'Öğrenci' : 'Veli'} silinirken bir hata oluştu`)
    }
  }

  const handleToggleStatus = async (item: any, type: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    const newStatus = item.user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    console.log('Toggle status:', {
      itemId: item.id,
      userId: item.user.id,
      email: item.user.email,
      currentStatus: item.user.status,
      newStatus: newStatus
    })
    
    try {
      const endpoint = type === 'student' ? 'students' : 'parents'
      const response = await fetch(`/api/teacher/${endpoint}/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh the appropriate list
        if (type === 'student') {
          loadStudents()
        } else {
          loadParents()
        }
        
        alert(`${type === 'student' ? 'Öğrenci' : 'Veli'} ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı!`)
      } else {
        alert(data.error || `${type === 'student' ? 'Öğrenci' : 'Veli'} durumu değiştirilirken bir hata oluştu`)
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      alert(`${type === 'student' ? 'Öğrenci' : 'Veli'} durumu değiştirilirken bir hata oluştu`)
    }
  }

  return (
    <TeacherLayout
      title="Öğrenci ve Veli Yönetimi"
      description="Öğrencilerinizi ve velilerini yönetin"
      showStudentSelector={true}
      selectedStudent={selectedStudent}
      onStudentChange={setSelectedStudent}
      students={students}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Toplam Öğrenci</p>
                <p className="text-3xl font-bold text-indigo-900">{students.length}</p>
                <p className="text-xs text-indigo-500">Aktif Öğrenciler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Toplam Veli</p>
                <p className="text-3xl font-bold text-emerald-900">{parents.length}</p>
                <p className="text-xs text-emerald-500">Kayıtlı Veliler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-rose-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-rose-600">Yeni Eklenen</p>
                <p className="text-3xl font-bold text-rose-900">0</p>
                <p className="text-xs text-rose-500">Bu Ay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-violet-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-violet-600">Aktif Hesaplar</p>
                <p className="text-3xl font-bold text-violet-900">{students.length + parents.length}</p>
                <p className="text-xs text-violet-500">Toplam Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap className="h-4 w-4 inline mr-2" />
              Öğrenciler ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('parents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parents'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="h-4 w-4 inline mr-2" />
              Veliler ({parents.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={activeTab === 'students' ? 'Öğrenci ara...' : 'Veli ara...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowAddParentModal(true)}
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Veli Ekle
          </Button>
          <Button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Öğrenci Ekle
          </Button>
        </div>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
              Öğrenci Listesi
            </CardTitle>
            <CardDescription>
              Öğrencilerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍🎓</div>
                <p className="text-gray-500 text-lg mb-2">Henüz öğrenci eklenmemiş</p>
                <p className="text-sm text-gray-400">İlk öğrencinizi eklemek için "Öğrenci Ekle" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sınıf/İl</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student: any) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.user.firstName} {student.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{student.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.grade ? `${student.grade}. Sınıf` : 'Belirtilmemiş'}</div>
                          <div className="text-sm text-gray-500">{student.city || 'İl belirtilmemiş'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.user.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student, 'student')}
                              className={student.user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            >
                              {student.user.status === 'ACTIVE' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(student, 'student')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parents Tab */}
      {activeTab === 'parents' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-emerald-600" />
              Veli Listesi
            </CardTitle>
            <CardDescription>
              Velilerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                <p className="text-gray-500 text-lg mb-2">Henüz veli eklenmemiş</p>
                <p className="text-sm text-gray-400">İlk velinizi eklemek için "Veli Ekle" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veli</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meslek</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parents.map((parent: any) => (
                      <tr key={parent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {parent.user.firstName} {parent.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{parent.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {parent.student ? `${parent.student.user.firstName} ${parent.student.user.lastName}` : 'Öğrenci seçilmemiş'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {parent.student ? `${parent.student.grade ? parent.student.grade + '. Sınıf' : 'Sınıf belirtilmemiş'}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parent.occupation || 'Belirtilmemiş'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            parent.user.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {parent.user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditParent(parent)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(parent, 'parent')}
                              className={parent.user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            >
                              {parent.user.status === 'ACTIVE' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(parent, 'parent')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Yeni Öğrenci Ekle"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci soyadı"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ogrenci@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci şifresi"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kayıt Tarihi</label>
              <input
                type="date"
                value={studentForm.registrationDate}
                onChange={(e) => setStudentForm({...studentForm, registrationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sınıf Düzeyi</label>
              <select
                value={studentForm.grade}
                onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sınıf seçin</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">5. Sınıf</option>
                <option value="6">6. Sınıf</option>
                <option value="7">7. Sınıf</option>
                <option value="8">8. Sınıf</option>
                <option value="9">9. Sınıf</option>
                <option value="10">10. Sınıf</option>
                <option value="11">11. Sınıf</option>
                <option value="12">12. Sınıf</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
            <select
              value={studentForm.city}
              onChange={(e) => setStudentForm({...studentForm, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">İl seçin</option>
              <option value="Adana">Adana</option>
              <option value="Adıyaman">Adıyaman</option>
              <option value="Afyonkarahisar">Afyonkarahisar</option>
              <option value="Ağrı">Ağrı</option>
              <option value="Amasya">Amasya</option>
              <option value="Ankara">Ankara</option>
              <option value="Antalya">Antalya</option>
              <option value="Artvin">Artvin</option>
              <option value="Aydın">Aydın</option>
              <option value="Balıkesir">Balıkesir</option>
              <option value="Bilecik">Bilecik</option>
              <option value="Bingöl">Bingöl</option>
              <option value="Bitlis">Bitlis</option>
              <option value="Bolu">Bolu</option>
              <option value="Burdur">Burdur</option>
              <option value="Bursa">Bursa</option>
              <option value="Çanakkale">Çanakkale</option>
              <option value="Çankırı">Çankırı</option>
              <option value="Çorum">Çorum</option>
              <option value="Denizli">Denizli</option>
              <option value="Diyarbakır">Diyarbakır</option>
              <option value="Edirne">Edirne</option>
              <option value="Elazığ">Elazığ</option>
              <option value="Erzincan">Erzincan</option>
              <option value="Erzurum">Erzurum</option>
              <option value="Eskişehir">Eskişehir</option>
              <option value="Gaziantep">Gaziantep</option>
              <option value="Giresun">Giresun</option>
              <option value="Gümüşhane">Gümüşhane</option>
              <option value="Hakkari">Hakkari</option>
              <option value="Hatay">Hatay</option>
              <option value="Isparta">Isparta</option>
              <option value="Mersin">Mersin</option>
              <option value="İstanbul">İstanbul</option>
              <option value="İzmir">İzmir</option>
              <option value="Kars">Kars</option>
              <option value="Kastamonu">Kastamonu</option>
              <option value="Kayseri">Kayseri</option>
              <option value="Kırklareli">Kırklareli</option>
              <option value="Kırşehir">Kırşehir</option>
              <option value="Kocaeli">Kocaeli</option>
              <option value="Konya">Konya</option>
              <option value="Kütahya">Kütahya</option>
              <option value="Malatya">Malatya</option>
              <option value="Manisa">Manisa</option>
              <option value="Kahramanmaraş">Kahramanmaraş</option>
              <option value="Mardin">Mardin</option>
              <option value="Muğla">Muğla</option>
              <option value="Muş">Muş</option>
              <option value="Nevşehir">Nevşehir</option>
              <option value="Niğde">Niğde</option>
              <option value="Ordu">Ordu</option>
              <option value="Rize">Rize</option>
              <option value="Sakarya">Sakarya</option>
              <option value="Samsun">Samsun</option>
              <option value="Siirt">Siirt</option>
              <option value="Sinop">Sinop</option>
              <option value="Sivas">Sivas</option>
              <option value="Tekirdağ">Tekirdağ</option>
              <option value="Tokat">Tokat</option>
              <option value="Trabzon">Trabzon</option>
              <option value="Tunceli">Tunceli</option>
              <option value="Şanlıurfa">Şanlıurfa</option>
              <option value="Uşak">Uşak</option>
              <option value="Van">Van</option>
              <option value="Yozgat">Yozgat</option>
              <option value="Zonguldak">Zonguldak</option>
              <option value="Aksaray">Aksaray</option>
              <option value="Bayburt">Bayburt</option>
              <option value="Karaman">Karaman</option>
              <option value="Kırıkkale">Kırıkkale</option>
              <option value="Batman">Batman</option>
              <option value="Şırnak">Şırnak</option>
              <option value="Bartın">Bartın</option>
              <option value="Ardahan">Ardahan</option>
              <option value="Iğdır">Iğdır</option>
              <option value="Yalova">Yalova</option>
              <option value="Karabük">Karabük</option>
              <option value="Kilis">Kilis</option>
              <option value="Osmaniye">Osmaniye</option>
              <option value="Düzce">Düzce</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={studentForm.notes}
              onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Öğrenci hakkında notlar"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowAddStudentModal(false)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Button>
          <Button
            onClick={handleAddStudent}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Öğrenci Ekle
          </Button>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditStudentModal}
        onClose={() => setShowEditStudentModal(false)}
        title="Öğrenci Düzenle"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci soyadı"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Öğrenci e-postası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre (Boş bırakırsanız değişmez)</label>
              <input
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yeni şifre"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kayıt Tarihi</label>
              <input
                type="date"
                value={studentForm.registrationDate}
                onChange={(e) => setStudentForm({...studentForm, registrationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sınıf Düzeyi</label>
              <select
                value={studentForm.grade}
                onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sınıf seçin</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">5. Sınıf</option>
                <option value="6">6. Sınıf</option>
                <option value="7">7. Sınıf</option>
                <option value="8">8. Sınıf</option>
                <option value="9">9. Sınıf</option>
                <option value="10">10. Sınıf</option>
                <option value="11">11. Sınıf</option>
                <option value="12">12. Sınıf</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
            <select
              value={studentForm.city}
              onChange={(e) => setStudentForm({...studentForm, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">İl seçin</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
              <option value="Adana">Adana</option>
              <option value="Konya">Konya</option>
              <option value="Gaziantep">Gaziantep</option>
              <option value="Mersin">Mersin</option>
              <option value="Diyarbakır">Diyarbakır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={studentForm.notes}
              onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Öğrenci hakkında notlar"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowEditStudentModal(false)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Button>
          <Button
            onClick={handleUpdateStudent}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg"
          >
            <Edit className="h-4 w-4 mr-2" />
            Öğrenci Güncelle
          </Button>
        </div>
      </Modal>

      {/* Add Parent Modal */}
      <Modal
        isOpen={showAddParentModal}
        onClose={() => setShowAddParentModal(false)}
        title="Yeni Veli Ekle"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={parentForm.firstName}
                onChange={(e) => setParentForm({...parentForm, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Veli adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={parentForm.lastName}
                onChange={(e) => setParentForm({...parentForm, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Veli soyadı"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={parentForm.email}
                onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="veli@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={parentForm.password}
                onChange={(e) => setParentForm({...parentForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Veli şifresi"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meslek</label>
              <input
                type="text"
                value={parentForm.occupation}
                onChange={(e) => setParentForm({...parentForm, occupation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Meslek"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öğrenci Seç</label>
              <select
                value={parentForm.studentId}
                onChange={(e) => setParentForm({...parentForm, studentId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Öğrenci seçin</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={parentForm.notes}
              onChange={(e) => setParentForm({...parentForm, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Veli hakkında notlar"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowAddParentModal(false)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Button>
          <Button
            onClick={handleAddParent}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Veli Ekle
          </Button>
        </div>
      </Modal>

      {/* Edit Parent Modal */}
      <Modal
        isOpen={showEditParentModal}
        onClose={() => setShowEditParentModal(false)}
        title="Veli Düzenle"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={parentForm.firstName}
                onChange={(e) => setParentForm({...parentForm, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Veli adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={parentForm.lastName}
                onChange={(e) => setParentForm({...parentForm, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Veli soyadı"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={parentForm.email}
                onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="veli@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre (Değiştirmek için)</label>
              <input
                type="password"
                value={parentForm.password}
                onChange={(e) => setParentForm({...parentForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Yeni şifre (opsiyonel)"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meslek</label>
              <input
                type="text"
                value={parentForm.occupation}
                onChange={(e) => setParentForm({...parentForm, occupation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Meslek"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öğrenci Seç</label>
              <select
                value={parentForm.studentId}
                onChange={(e) => setParentForm({...parentForm, studentId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Öğrenci seçin</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={parentForm.notes}
              onChange={(e) => setParentForm({...parentForm, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Veli hakkında notlar"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowEditParentModal(false)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Button>
          <Button
            onClick={handleUpdateParent}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <Edit className="h-4 w-4 mr-2" />
            Güncelle
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`${deleteType === 'student' ? 'Öğrenci' : 'Veli'} Sil`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {deleteType === 'student' ? 'Öğrenci' : 'Veli'} Silinecek
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {selectedItem && `${selectedItem.user.firstName} ${selectedItem.user.lastName}`} adlı {deleteType === 'student' ? 'öğrenci' : 'veli'} kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </TeacherLayout>
  )
}