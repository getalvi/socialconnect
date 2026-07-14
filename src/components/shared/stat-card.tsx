'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  className?: string;
}

export function StatCard({ title, value, change, icon: Icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
        </div>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-sm">
            {isPositive && <TrendingUp className="h-4 w-4 text-emerald-500" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
            {isNeutral && <Minus className="h-4 w-4 text-muted-foreground" />}
            <span
              className={cn(
                'font-medium',
                isPositive && 'text-emerald-500',
                isNegative && 'text-red-500',
                isNeutral && 'text-muted-foreground'
              )}
            >
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}