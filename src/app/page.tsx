import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Eğitim Parkuru</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button>Giriş Yap</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Özel Ders & Eğitim Koçluğu Platformu
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Eğitim Parkuru ile özel ders veren öğretmenler ve eğitim koçları için kapsamlı öğrenci yönetim sistemi. Öğrenci takibi, ödev yönetimi ve veli iletişimi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto">
                Sisteme Giriş
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Özellikleri Keşfet
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Sistem Özellikleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">👨‍💼 Platform Yönetimi</CardTitle>
                <CardDescription>
                  Öğretmen kayıtları, sistem ayarları ve genel yönetim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Öğretmen kayıt yönetimi</li>
                  <li>• Platform ayarları</li>
                  <li>• İstatistik ve raporlar</li>
                  <li>• Güvenlik kontrolleri</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">👨‍🏫 Öğretmen/Eğitim Koçu Paneli</CardTitle>
                <CardDescription>
                  Öğrenci yönetimi, ödev oluşturma ve ilerleme takibi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Öğrenci kayıt yönetimi</li>
                  <li>• Ödev ve proje oluşturma</li>
                  <li>• İlerleme takibi</li>
                  <li>• Veli iletişimi</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">🎓 Öğrenci Paneli</CardTitle>
                <CardDescription>
                  Ödevler, ilerleme takibi ve öğretmen iletişimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ödev görüntüleme ve teslim</li>
                  <li>• İlerleme takibi</li>
                  <li>• Ders programı</li>
                  <li>• Öğretmen iletişimi</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">👨‍👩‍👧‍👦 Veli Paneli</CardTitle>
                <CardDescription>
                  Çocuğunuzun özel ders durumunu takip edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Çocuk takibi</li>
                  <li>• İlerleme raporları</li>
                  <li>• Öğretmen iletişimi</li>
                  <li>• Ödev durumu</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Teknoloji Altyapısı
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">Next.js 15</div>
                <p className="text-sm text-gray-600">Modern React Framework</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">TypeScript</div>
                <p className="text-sm text-gray-600">Type Safety</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">PostgreSQL</div>
                <p className="text-sm text-gray-600">Güçlü Veritabanı</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">Prisma</div>
                <p className="text-sm text-gray-600">Modern ORM</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Eğitim Parkuru</h3>
            <p className="text-gray-400 mb-6">
              Özel ders veren öğretmenler ve eğitim koçları için modern öğrenci yönetim platformu.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/auth/login" className="text-gray-400 hover:text-white">
                Sisteme Giriş
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
