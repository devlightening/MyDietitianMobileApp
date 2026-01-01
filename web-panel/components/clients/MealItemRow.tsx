"use client";

import { ComplianceBadge } from './ComplianceBadge';
import { Badge } from '@/components/ui/Badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface MealItemData {
  mealItemId: string;
  ingredientId: string;
  ingredientName: string;
  isMandatory: boolean;
  status: 'done' | 'skipped' | 'alternative' | null;
  markedAt: string | null;
  alternativeIngredientId: string | null;
  alternativeIngredientName: string | null;
}

interface MealItemRowProps {
  item: MealItemData;
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export function MealItemRow({ item }: MealItemRowProps) {
  const t = useTranslations('compliance');
  const status: 'done' | 'skipped' | 'alternative' | 'not-marked' = 
    item.status === null ? 'not-marked' : item.status;

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-b-0">
      <div className="flex-1 flex items-center gap-3">
        {/* Ingredient Name */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{item.ingredientName}</span>
            {item.isMandatory && (
              <Badge variant="primary" className="text-xs">{t('mandatory')}</Badge>
            )}
            {!item.isMandatory && (
              <Badge variant="secondary" className="text-xs">{t('optional')}</Badge>
            )}
          </div>
          {item.status === 'alternative' && item.alternativeIngredientName && (
            <div className="text-xs text-muted-foreground mt-1">
              → {item.alternativeIngredientName}
            </div>
          )}
          {item.markedAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(item.markedAt)}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <ComplianceBadge status={status} />
      </div>
    </div>
  );
}

