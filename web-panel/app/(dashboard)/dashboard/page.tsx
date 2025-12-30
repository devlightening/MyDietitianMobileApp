import DietitianGuard from '@/components/DietitianGuard'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { Skeleton } from '@/components/ui/Skeleton'

// Already protected by DietitianGuard
export default function DashboardPage() {
  // Mocked summary data
  const recipeCount = 0;
  const accessKeyCount = 0;
  const [loading] = [false]; // Replace with real loading logic if needed
  if (loading) return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col items-center">
            <Skeleton className="h-12 w-20 mb-2" />
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground">Welcome, Dietitian!</h1>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow">
          <span className="text-5xl font-bold text-primary">{recipeCount}</span>
          <span className="text-lg mt-2 text-card-foreground font-medium">Recipes</span>
          <Link href="/dashboard/recipes" className="mt-4 text-primary hover:underline font-medium">View Recipes</Link>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow">
          <span className="text-5xl font-bold text-primary">{accessKeyCount}</span>
          <span className="text-lg mt-2 text-card-foreground font-medium">Access Keys</span>
          <Link href="/dashboard/access-keys" className="mt-4 text-primary hover:underline font-medium">Manage Keys</Link>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <span className="text-5xl mb-4 block">👋</span>
        <p className="text-xl mb-2 font-semibold text-card-foreground">Your dashboard is ready</p>
        <p className="text-muted-foreground">You have no recipes or access keys yet.<br />Start by adding a recipe or generating an access key for your clients.</p>
      </div>
    </div>
  )
}
