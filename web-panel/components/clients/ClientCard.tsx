"use client";

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ClientStatusBadge } from './ClientStatusBadge';
import { ArrowRight, Clock, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientCardData {
  clientId: string;
  clientName: string;
  todayCompliancePercentage: number;
  lastActivity: string | null;
  currentMeal: string | null;
  lastMealItem: string | null;
}

interface ClientCardProps {
  client: ClientCardData;
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return 'No activity';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Unknown';
  }
}

function getComplianceColor(percentage: number, hasActivity: boolean): string {
  if (!hasActivity) return 'text-muted-foreground';
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

export function ClientCard({ client }: ClientCardProps) {
  const hasActivity = client.lastActivity !== null;
  const complianceColor = getComplianceColor(client.todayCompliancePercentage, hasActivity);
  
  return (
    <Link href={`/dashboard/clients/${client.clientId}`}>
      <Card className="p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {client.clientName}
              </h3>
              <ClientStatusBadge 
                compliancePercentage={client.todayCompliancePercentage}
                hasActivity={hasActivity}
              />
            </div>
          </div>

          {/* Compliance Percentage */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-4xl font-bold',
                complianceColor
              )}>
                {hasActivity ? client.todayCompliancePercentage.toFixed(0) : '—'}
              </span>
              {hasActivity && (
                <span className="text-sm text-muted-foreground">%</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today's compliance</p>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            {client.lastActivity && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatTimeAgo(client.lastActivity)}</span>
              </div>
            )}
            
            {client.currentMeal && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UtensilsCrossed className="w-4 h-4" />
                <span>{client.currentMeal}</span>
                {client.lastMealItem && (
                  <span className="text-xs">• {client.lastMealItem}</span>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              <span>View details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

