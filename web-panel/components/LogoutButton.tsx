"use client"
import { useRouter } from "next/navigation"
import { useQueryClient } from '@tanstack/react-query'
import { logout } from '@/lib/auth'

export default function LogoutButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    router.push("/auth/login")
  }
  return (
    <button className="text-sm text-primary hover:underline font-medium ml-4 transition-colors" onClick={handleLogout}>
      Çıkış Yap
    </button>
  )
}
