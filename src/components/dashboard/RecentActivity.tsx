import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StockMovement } from '@/types/medicine';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  movements: StockMovement[];
  className?: string;
}

export function RecentActivity({ movements, className }: RecentActivityProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Stock Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-4">
            {movements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className={cn(
                    "mt-0.5 rounded-full p-1",
                    movement.type === 'stock-in' 
                      ? "bg-[hsl(var(--in-stock))]/10 text-[hsl(var(--in-stock))]" 
                      : "bg-[hsl(var(--low-stock))]/10 text-[hsl(var(--low-stock))]"
                  )}>
                    {movement.type === 'stock-in' ? (
                      <ArrowDownCircle className="h-4 w-4" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {movement.medicineName}
                      </p>
                      <span className={cn(
                        "text-sm font-semibold",
                        movement.type === 'stock-in' 
                          ? "text-[hsl(var(--in-stock))]" 
                          : "text-[hsl(var(--low-stock))]"
                      )}>
                        {movement.type === 'stock-in' ? '+' : '-'}{movement.quantity} units
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{movement.reason}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By {movement.performedBy}</span>
                      <span>
                        {new Date(movement.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
