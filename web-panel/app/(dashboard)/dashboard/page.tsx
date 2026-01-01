"use client";

import DietitianGuard from '@/components/DietitianGuard'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ChefHat, Key, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Already protected by DietitianGuard at layout level
export default function DashboardPage() {
  // Mocked summary data - replace with real data from API
  const recipeCount = 0;
  const accessKeyCount = 0;
  const loading = false; // Replace with real loading logic if needed

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-20 mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-8 text-center">
          <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </Card>
      </div>
    );
  }

  const hasData = recipeCount > 0 || accessKeyCount > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Here's an overview of your account.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipes</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{recipeCount}</p>
                </div>
              </div>
              <Link 
                href="/dashboard/recipes"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:gap-3"
              >
                View Recipes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Access Keys</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{accessKeyCount}</p>
                </div>
              </div>
              <Link 
                href="/dashboard/access-keys"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:gap-3"
              >
                Manage Keys
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      {!hasData && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">👋</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Your dashboard is ready</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              You have no recipes or access keys yet. Start by adding a recipe or generating an access key for your clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/recipes">
                <Button variant="primary" className="w-full sm:w-auto">
                  Add Recipe
                </Button>
              </Link>
              <Link href="/dashboard/access-keys">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Generate Access Key
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
