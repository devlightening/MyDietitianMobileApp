"use client"
import { useRouter } from "next/navigation"
import { useQueryClient } from '@tanstack/react-query'

export default function LogoutButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const handleLogout = () => {
    window.localStorage.removeItem("jwt")
    queryClient.clear()
    router.push("/login")
  }
  return (
    <button className="text-sm text-accent underline ml-4" onClick={handleLogout}>
      Çıkış Yap
    </button>
  )
}
