import DietitianGuard from '@/components/DietitianGuard'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function DashboardPage() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hoşgeldiniz, Diyetisyen!</h1>
        <LogoutButton />
      </div>
      <nav className="flex gap-6 mb-6">
        <Link href="/recipes" className="text-accent underline">Tarifler</Link>
        <Link href="/access-keys" className="text-accent underline">Erişim Anahtarları</Link>
      </nav>
      <div className="border rounded p-4 bg-white">Panelinize hoşgeldiniz. Sol üstten sayfalar arası geçiş yapabilirsiniz.</div>
    </div>
  )
}
