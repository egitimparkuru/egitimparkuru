'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function SetupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup')
      const data = await response.json()
      
      if (data.success) {
        setIsSetup(data.data.isSetup)
        if (data.data.isSetup) {
          router.push('/auth/login')
        }
      }
    } catch (err) {
      console.error('Setup status check failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sistem kurulumu başarısız')
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('sessionToken', data.data.sessionToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSetup === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Sistem Kurulu</CardTitle>
            <CardDescription>
              Sistem zaten kurulmuş. Giriş sayfasına yönlendiriliyorsunuz...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Eğitim Parkuru</CardTitle>
          <CardDescription>
            Sistem kurulumu - İlk admin kullanıcısını oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                <strong>Dikkat:</strong> Bu işlem sadece bir kez yapılabilir. 
                İlk admin kullanıcısı oluşturulduktan sonra diğer kullanıcılar 
                admin paneli üzerinden yönetilecektir.
              </p>
            </div>
            
            <Input
              label="Ad"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Ahmet"
            />
            
            <Input
              label="Soyad"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Yılmaz"
            />
            
            <Input
              label="E-posta"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@edutracktpro.com"
            />
            
            <Input
              label="Departman"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Bilgi İşlem"
            />
            
            <Input
              label="Şifre"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
            
            <Input
              label="Şifre Tekrar"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
            
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Sistemi Kur ve Admin Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

