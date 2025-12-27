import { AlertTriangle, Clock, Package, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/types/medicine';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alert[];
  className?: string;
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'expiry':
        return <Clock className="h-4 w-4" />;
      case 'low-stock':
      case 'out-of-stock':
        return <Package className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-[hsl(var(--critical))]/10 text-[hsl(var(--critical))] border-[hsl(var(--critical))]/20';
      case 'warning':
        return 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
          Active Alerts
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No active alerts
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    getSeverityStyles(alert.severity),
                    !alert.isRead && "ring-1 ring-inset ring-current/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-xs opacity-80">{alert.message}</p>
                      <p className="text-xs opacity-60">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
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
