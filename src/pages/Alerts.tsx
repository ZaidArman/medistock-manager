import { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Clock, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAlerts } from '@/data/mockData';
import { Alert } from '@/types/medicine';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Alerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'expiry':
        return <Clock className="h-5 w-5" />;
      case 'low-stock':
      case 'out-of-stock':
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          card: 'border-l-4 border-l-[hsl(var(--critical))]',
          icon: 'bg-[hsl(var(--critical))]/10 text-[hsl(var(--critical))]',
          badge: 'bg-[hsl(var(--critical))] text-[hsl(var(--critical-foreground))]',
        };
      case 'warning':
        return {
          card: 'border-l-4 border-l-[hsl(var(--warning))]',
          icon: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
          badge: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
        };
      default:
        return {
          card: 'border-l-4 border-l-primary',
          icon: 'bg-primary/10 text-primary',
          badge: 'bg-primary text-primary-foreground',
        };
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    toast({
      title: 'All alerts marked as read',
      description: 'Your notification inbox has been cleared.',
    });
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const expiryAlerts = alerts.filter(a => a.type === 'expiry');
  const stockAlerts = alerts.filter(a => a.type === 'low-stock' || a.type === 'out-of-stock');

  const AlertCard = ({ alert }: { alert: Alert }) => {
    const styles = getSeverityStyles(alert.severity);
    
    return (
      <Card className={cn(styles.card, !alert.isRead && 'bg-card/80')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn('rounded-lg p-2', styles.icon)}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-foreground">{alert.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={styles.badge}>
                    {alert.severity === 'critical' ? 'Critical' : 
                     alert.severity === 'warning' ? 'Warning' : 'Info'}
                  </Badge>
                  {!alert.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {!alert.isRead && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout 
      title="Alerts" 
      subtitle="Monitor expiry dates and stock levels"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
            Notification Center
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive">{unreadAlerts.length} new</Badge>
            )}
          </CardTitle>
          {unreadAlerts.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="expiry">
                Expiry ({expiryAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="stock">
                Stock ({stockAlerts.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {alerts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No alerts</p>
              ) : (
                alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </TabsContent>
            
            <TabsContent value="expiry" className="space-y-4">
              {expiryAlerts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No expiry alerts</p>
              ) : (
                expiryAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </TabsContent>
            
            <TabsContent value="stock" className="space-y-4">
              {stockAlerts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No stock alerts</p>
              ) : (
                stockAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
