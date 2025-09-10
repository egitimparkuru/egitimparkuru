'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Edit, 
  Save,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    bio: '',
    avatar: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    // TODO: API endpoint'i oluşturulacak
    setProfile({
      firstName: 'Öğretmen',
      lastName: 'Adı',
      email: 'ogretmen@edutracktpro.com',
      phone: '+90 555 123 4567',
      address: 'İstanbul, Türkiye',
      specialization: 'Matematik',
      experience: '5 yıl',
      bio: 'Matematik öğretmeni olarak 5 yıllık deneyime sahibim. Öğrencilerimin başarısı için çalışıyorum.',
      avatar: ''
    })
    setLoading(false)
  }

  const handleSave = () => {
    // TODO: API endpoint'i oluşturulacak
    setIsEditing(false)
    alert('Profil güncellendi!')
  }

  return (
    <TeacherLayout
      title="Profil"
      description="Profil bilgilerinizi görüntüleyin ve düzenleyin"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-32 w-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{profile.specialization} Öğretmeni</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {profile.email}
                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {profile.phone}
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile.address}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>
                    Kişisel bilgilerinizi düzenleyin
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "border-gray-300 text-gray-700 hover:bg-gray-50" : ""}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanı</label>
                    <input
                      type="text"
                      value={profile.specialization}
                      onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deneyim</label>
                    <input
                      type="text"
                      value={profile.experience}
                      onChange={(e) => setProfile({...profile, experience: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hakkımda</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Toplam Ders</p>
                <p className="text-3xl font-bold text-blue-900">0</p>
                <p className="text-xs text-blue-500">Verilen Dersler</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Öğrenci</p>
                <p className="text-3xl font-bold text-green-900">0</p>
                <p className="text-xs text-green-500">Toplam Öğrenci</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Başarı</p>
                <p className="text-3xl font-bold text-purple-900">0%</p>
                <p className="text-xs text-purple-500">Başarı Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Deneyim</p>
                <p className="text-3xl font-bold text-orange-900">5</p>
                <p className="text-xs text-orange-500">Yıl Deneyim</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}