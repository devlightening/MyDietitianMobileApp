import ServerGuard from '@/components/ServerGuard'

export default function ClientGroupLayout({ children }: { children: React.ReactNode }) {
  return <ServerGuard redirectTo="/auth/client-access">{children}</ServerGuard>
}
