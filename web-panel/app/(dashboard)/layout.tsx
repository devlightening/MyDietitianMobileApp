// app/(dashboard)/layout.tsx
import ServerGuard from "@/components/ServerGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServerGuard>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ServerGuard>
  )
}
