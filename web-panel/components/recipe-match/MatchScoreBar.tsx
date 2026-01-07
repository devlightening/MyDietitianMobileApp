'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface MatchScoreBarProps {
  score: number;
  className?: string;
}

export function MatchScoreBar({ score, className }: MatchScoreBarProps) {
  const t = useTranslations('recipeMatch');
  
  const getColorClass = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{score}%</span>
        <span className="text-xs text-muted-foreground">{t('matchScore')}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 rounded-full', getColorClass())}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

