import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface ExpiryBadgeProps {
  expiryDate: string;
  className?: string;
}

export function ExpiryBadge({ expiryDate, className }: ExpiryBadgeProps) {
  const expiry = parseISO(expiryDate);
  
  if (!isValid(expiry)) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Invalid Date
      </Badge>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) {
    return (
      <Badge className={cn(
        "bg-[hsl(var(--expired))] text-[hsl(var(--expired-foreground))] hover:bg-[hsl(var(--expired))]/90",
        className
      )}>
        Expired {Math.abs(daysUntilExpiry)} days ago
      </Badge>
    );
  }

  if (daysUntilExpiry === 0) {
    return (
      <Badge className={cn(
        "bg-[hsl(var(--critical))] text-[hsl(var(--critical-foreground))] hover:bg-[hsl(var(--critical))]/90",
        className
      )}>
        Expires Today
      </Badge>
    );
  }

  if (daysUntilExpiry <= 7) {
    return (
      <Badge className={cn(
        "bg-[hsl(var(--critical))] text-[hsl(var(--critical-foreground))] hover:bg-[hsl(var(--critical))]/90",
        className
      )}>
        {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left
      </Badge>
    );
  }

  if (daysUntilExpiry <= 30) {
    return (
      <Badge className={cn(
        "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/90",
        className
      )}>
        {daysUntilExpiry} days left
      </Badge>
    );
  }

  if (daysUntilExpiry <= 90) {
    return (
      <Badge className={cn(
        "bg-[hsl(var(--low-stock))] text-[hsl(var(--low-stock-foreground))] hover:bg-[hsl(var(--low-stock))]/90",
        className
      )}>
        {daysUntilExpiry} days left
      </Badge>
    );
  }

  // More than 90 days
  const months = Math.floor(daysUntilExpiry / 30);
  return (
    <Badge variant="outline" className={cn("text-muted-foreground", className)}>
      {months} month{months !== 1 ? 's' : ''} left
    </Badge>
  );
}
