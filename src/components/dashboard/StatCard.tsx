import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'critical';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-card border-l-4 border-l-[hsl(var(--in-stock))]',
    warning: 'bg-card border-l-4 border-l-[hsl(var(--warning))]',
    critical: 'bg-card border-l-4 border-l-[hsl(var(--critical))]',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={cn(
                "mt-1 text-xs font-medium",
                trend.isPositive ? "text-[hsl(var(--in-stock))]" : "text-[hsl(var(--critical))]"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
