"use client"
import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function DietitianGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [])
  return <>{children}</>
}
