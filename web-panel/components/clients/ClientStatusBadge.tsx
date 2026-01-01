import { cn } from '@/lib/utils';

interface ClientStatusBadgeProps {
  compliancePercentage: number;
  hasActivity?: boolean;
  className?: string;
}

export function ClientStatusBadge({ 
  compliancePercentage, 
  hasActivity = true,
  className 
}: ClientStatusBadgeProps) {
  const getStatusColor = () => {
    if (!hasActivity) {
      return {
        bg: 'bg-muted/20',
        border: 'border-muted',
        text: 'text-muted-foreground',
        label: 'No activity'
      };
    }
    
    if (compliancePercentage >= 80) {
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-500',
        label: 'Excellent'
      };
    }
    
    if (compliancePercentage >= 50) {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/50',
        text: 'text-yellow-500',
        label: 'Good'
      };
    }
    
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-500',
      label: 'Needs attention'
    };
  };

  const status = getStatusColor();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        status.bg,
        status.border,
        status.text,
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', status.bg, status.border.replace('/50', ''))} />
      <span className="text-xs font-medium">{status.label}</span>
    </div>
  );
}

