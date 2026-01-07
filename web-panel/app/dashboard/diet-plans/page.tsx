'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, Plus, Eye } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

export default function DietPlansPage() {
  const router = useRouter();
  const t = useTranslations('dietPlans');
  const tCommon = useTranslations('common');

  // Fetch clients - we'll check their diet plan status
  const { clients, isLoading, error } = useClients();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Diet Plans</h1>
            <p className="text-muted-foreground mt-2">Manage diet plans for your clients</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Diet Plans</h1>
            <p className="text-muted-foreground mt-2">Manage diet plans for your clients</p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
            <p className="text-destructive">Failed to load diet plans</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {tCommon('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Diet Plans</h1>
            <p className="text-muted-foreground mt-2">Manage diet plans for your clients</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-6">
              You need to add clients before creating diet plans
            </p>
            <button
              onClick={() => router.push('/dashboard/access-keys')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Access Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diet Plans</h1>
            <p className="text-muted-foreground mt-2">Manage diet plans for your clients</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diet-plans/create')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Diet Plan
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <ClientPlanCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Client Card Component
function ClientPlanCard({ client }: { client: any }) {
  const router = useRouter();

  // For now, we'll show all clients without plan status
  // In production, you'd want to check if they have an active plan
  const hasPlan = false; // TODO: Check via API

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{client.fullName}</h3>
        <p className="text-sm text-muted-foreground">{client.email}</p>
      </div>

      {hasPlan ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
              Active
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Plan: Weekly Meal Plan</p>
            <p>Jan 1 - Jan 7, 2026</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/diet-plans/${client.id}`)}
            className="w-full px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 inline-flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">No active diet plan</p>
          <button
            onClick={() => router.push(`/dashboard/diet-plans/create?clientId=${client.id}`)}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      )}
    </div>
  );
}
