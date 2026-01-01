"use client";

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DailyDataPoint {
  date: string;
  compliance: number;
}

interface WeeklyTrendChartProps {
  data: DailyDataPoint[];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getBarColor(compliance: number): string {
  if (compliance >= 80) return 'bg-green-500';
  if (compliance >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getBarHeight(compliance: number, maxHeight: number = 120): string {
  const percentage = Math.max(0, Math.min(100, compliance));
  const height = (percentage / 100) * maxHeight;
  return `${height}px`;
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Trend</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No data available for the last 7 days</p>
        </div>
      </Card>
    );
  }

  const maxCompliance = Math.max(...data.map(d => d.compliance), 100);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Last 7 Days</h2>
      
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((point, index) => {
          const barColor = getBarColor(point.compliance);
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center gap-2 group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 px-3 py-2 rounded-md bg-popover border border-border shadow-lg z-10 whitespace-nowrap">
                  <div className="text-sm font-semibold text-popover-foreground">
                    {formatDate(point.date)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {point.compliance.toFixed(0)}% compliance
                  </div>
                </div>
              )}

              {/* Bar */}
              <div
                className={cn(
                  'w-full rounded-t transition-all duration-200 cursor-pointer',
                  barColor,
                  isHovered ? 'opacity-100' : 'opacity-80',
                  isHovered && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                style={{ height: getBarHeight(point.compliance) }}
              />

              {/* Date Label */}
              <div className="text-xs text-muted-foreground text-center">
                {formatDate(point.date).split(' ')[1]} {/* Just the day number */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">0%</span>
        <span className="text-xs text-muted-foreground">50%</span>
        <span className="text-xs text-muted-foreground">100%</span>
      </div>
    </Card>
  );
}

