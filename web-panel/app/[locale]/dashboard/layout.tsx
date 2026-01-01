// app/[locale]/dashboard/layout.tsx
import ServerGuard from "@/components/ServerGuard"
import { AppLayout } from "@/components/layout/AppLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServerGuard>
      <AppLayout>{children}</AppLayout>
    </ServerGuard>
  )
}

