import { Card } from '@/components/ui/Card';
import { AlertCircle, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type InsightType = 'warning' | 'info' | 'positive';

interface InsightCardProps {
  type: InsightType;
  title: string;
  message: string;
}

function getInsightConfig(type: InsightType) {
  switch (type) {
    case 'warning':
      return {
        icon: AlertCircle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      };
    case 'positive':
      return {
        icon: TrendingUp,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
      };
    case 'info':
    default:
      return {
        icon: Info,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30'
      };
  }
}

export function InsightCard({ type, title, message }: InsightCardProps) {
  const config = getInsightConfig(type);
  const Icon = config.icon;

  return (
    <Card className={cn('p-4 border', config.bgColor, config.borderColor)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5', config.iconColor)} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </Card>
  );
}

