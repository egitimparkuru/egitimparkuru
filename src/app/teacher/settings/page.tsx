'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { 
  Save,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      taskReminders: true,
      examReminders: true,
      messageNotifications: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    },
    appearance: {
      theme: 'light',
      language: 'tr',
      timezone: 'Europe/Istanbul'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    // TODO: API endpoint'i oluşturulacak
    setLoading(false)
  }

  const handleSave = () => {
    // TODO: API endpoint'i oluşturulacak
    alert('Ayarlar kaydedildi!')
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor!')
      return
    }
    // TODO: API endpoint'i oluşturulacak
    alert('Şifre değiştirildi!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <TeacherLayout
      title="Ayarlar"
      description="Hesap ayarlarınızı yönetin"
    >
      <div className="space-y-8">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Bildirim Ayarları
            </CardTitle>
            <CardDescription>
              Hangi bildirimleri almak istediğinizi seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h4>
                  <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta alın</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: !settings.notifications.email }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Bildirimleri</h4>
                  <p className="text-sm text-gray-500">Tarayıcı bildirimleri alın</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: !settings.notifications.push }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Görev Hatırlatıcıları</h4>
                  <p className="text-sm text-gray-500">Görev son tarihleri için hatırlatma alın</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, taskReminders: !settings.notifications.taskReminders }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.taskReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.taskReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Gizlilik Ayarları
            </CardTitle>
            <CardDescription>
              Profil görünürlüğünüzü ve gizlilik tercihlerinizi ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profil Görünürlüğü</label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, profileVisibility: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Herkes</option>
                  <option value="students">Sadece Öğrencilerim</option>
                  <option value="private">Gizli</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-posta Adresini Göster</h4>
                  <p className="text-sm text-gray-500">Profilinizde e-posta adresiniz görünsün</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, showEmail: !settings.privacy.showEmail }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Mesaj Almayı İzin Ver</h4>
                  <p className="text-sm text-gray-500">Öğrenciler ve veliler size mesaj gönderebilsin</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, allowMessages: !settings.privacy.allowMessages }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.allowMessages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2 text-purple-600" />
              Görünüm Ayarları
            </CardTitle>
            <CardDescription>
              Arayüz tercihlerinizi ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, theme: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Saat Dilimi</label>
                <select
                  value={settings.appearance.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-red-600" />
              Güvenlik Ayarları
            </CardTitle>
            <CardDescription>
              Hesap güvenliğinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Password Change */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Şifre Değiştir
                  </Button>
                </div>
              </div>

              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">İki Faktörlü Kimlik Doğrulama</h4>
                  <p className="text-sm text-gray-500">Hesabınızı daha güvenli hale getirin</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactor: !settings.security.twoFactor }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.twoFactor ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Giriş Uyarıları</h4>
                  <p className="text-sm text-gray-500">Yeni cihazlardan giriş yapıldığında bildirim alın</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    security: { ...settings.security, loginAlerts: !settings.security.loginAlerts }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg px-8 py-3"
          >
            <Save className="h-4 w-4 mr-2" />
            Tüm Ayarları Kaydet
          </Button>
        </div>
      </div>
    </TeacherLayout>
  )
}