import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type MedicineStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'expiring-soon';

interface StatusBadgeProps {
  status: MedicineStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    'in-stock': {
      label: 'In Stock',
      className: 'bg-[hsl(var(--in-stock))] text-[hsl(var(--in-stock-foreground))] hover:bg-[hsl(var(--in-stock))]/90',
    },
    'low-stock': {
      label: 'Low Stock',
      className: 'bg-[hsl(var(--low-stock))] text-[hsl(var(--low-stock-foreground))] hover:bg-[hsl(var(--low-stock))]/90',
    },
    'out-of-stock': {
      label: 'Out of Stock',
      className: 'bg-[hsl(var(--critical))] text-[hsl(var(--critical-foreground))] hover:bg-[hsl(var(--critical))]/90',
    },
    'expired': {
      label: 'Expired',
      className: 'bg-[hsl(var(--expired))] text-[hsl(var(--expired-foreground))] hover:bg-[hsl(var(--expired))]/90',
    },
    'expiring-soon': {
      label: 'Expiring Soon',
      className: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/90',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
