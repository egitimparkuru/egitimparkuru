'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılamadı')
      }

      // Check if user is active
      if (data.data.user.status !== 'ACTIVE') {
        throw new Error('Hesabınız pasif durumda. Lütfen sistem yöneticinizle iletişime geçin.')
      }

      // Store tokens
      localStorage.setItem('token', data.data.accessToken) // 'accessToken' yerine 'token'
      localStorage.setItem('accessToken', data.data.accessToken) // Eski uyumluluk için
      localStorage.setItem('sessionToken', data.data.sessionToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirect based on user role
      const user = data.data.user
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard')
          break
        case 'TEACHER':
          router.push('/teacher/dashboard')
          break
        case 'STUDENT':
          router.push('/student/dashboard')
          break
        case 'PARENT':
          router.push('/parent/dashboard')
          break
        default:
          router.push('/dashboard')
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Eğitim Parkuru</CardTitle>
          <CardDescription>
            Eğitim yönetim sistemi - Tüm kullanıcılar için tek giriş
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <Input
              label="E-posta"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ornek@email.com"
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
            
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Giriş Yap
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Admin, Öğretmen, Öğrenci veya Veli hesabınızla giriş yapabilirsiniz.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Hesabınız yoksa sistem yöneticinizle iletişime geçin.
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              ← Ana sayfaya dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
