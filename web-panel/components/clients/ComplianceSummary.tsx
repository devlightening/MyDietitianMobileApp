"use client";

import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceSummaryProps {
  averageCompliance: number;
  bestDay: { date: string; compliance: number } | null;
  worstDay: { date: string; compliance: number } | null;
  trend: 'up' | 'down' | 'stable' | null;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getComplianceColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

export function ComplianceSummary({
  averageCompliance,
  bestDay,
  worstDay,
  trend
}: ComplianceSummaryProps) {
  const avgColor = getComplianceColor(averageCompliance);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Compliance */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Average (7 days)</p>
          <div className={cn('text-3xl font-bold', avgColor)}>
            {averageCompliance.toFixed(0)}%
          </div>
          {trend && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
              <span className="capitalize">{trend}</span>
            </div>
          )}
        </div>

        {/* Best Day */}
        {bestDay && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Best Day</p>
            <div className="text-2xl font-bold text-green-500">
              {bestDay.compliance.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(bestDay.date)}
            </p>
          </div>
        )}

        {/* Worst Day */}
        {worstDay && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Worst Day</p>
            <div className="text-2xl font-bold text-red-500">
              {worstDay.compliance.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(worstDay.date)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

