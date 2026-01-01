"use client";

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type ComplianceStatus = 'done' | 'skipped' | 'alternative' | 'not-marked';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  className?: string;
}

export function ComplianceBadge({ status, className }: ComplianceBadgeProps) {
  const t = useTranslations('compliance');
  
  const getStatusConfig = () => {
    switch (status) {
      case 'done':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/50',
          text: 'text-green-500',
          label: t('done'),
          dot: 'bg-green-500'
        };
      case 'alternative':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/50',
          text: 'text-yellow-500',
          label: t('alternative'),
          dot: 'bg-yellow-500'
        };
      case 'skipped':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/50',
          text: 'text-red-500',
          label: t('skipped'),
          dot: 'bg-red-500'
        };
      case 'not-marked':
      default:
        return {
          bg: 'bg-muted/20',
          border: 'border-muted',
          text: 'text-muted-foreground',
          label: t('notMarked'),
          dot: 'bg-muted'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium',
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <div className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
    </div>
  );
}

