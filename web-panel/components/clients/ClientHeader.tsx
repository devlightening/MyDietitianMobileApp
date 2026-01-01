"use client";

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ClientHeaderProps {
  clientName: string;
  selectedDate: Date;
  dailyCompliancePercentage: number;
  lastActivity: string | null;
  onDateChange: (date: Date) => void;
}

function formatDate(date: Date, t: any): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t('today');
  if (diffDays === -1) return t('yesterday');
  if (diffDays === 1) return t('tomorrow');
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function getComplianceColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

export function ClientHeader({
  clientName,
  selectedDate,
  dailyCompliancePercentage,
  lastActivity,
  onDateChange
}: ClientHeaderProps) {
  const t = useTranslations('compliance');
  const tCommon = useTranslations('common');
  
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const complianceColor = getComplianceColor(dailyCompliancePercentage);
  
  // Check if selected date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  const isToday = selected.getTime() === today.getTime();
  
  const maxDate = new Date(); // Can't go to future

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Client Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground mb-2">{clientName}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {lastActivity && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTimeAgo(lastActivity)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Compliance & Date Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Daily Compliance */}
          <div className="text-center md:text-right">
            <div className={cn('text-4xl font-bold', complianceColor)}>
              {dailyCompliancePercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dailyCompliance')}</p>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePreviousDay}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(new Date(e.target.value));
                    }
                  }}
                  className="px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                />
              </div>
              {!isToday && (
                <Button
                  variant="secondary"
                  onClick={handleToday}
                  className="text-xs px-3 py-1 h-auto"
                >
                  {t('today')}
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={handleNextDay}
              disabled={isToday}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

