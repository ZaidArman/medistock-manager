import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Truck } from 'lucide-react';
import { SupplierPerformance } from '@/hooks/useAnalytics';

interface SupplierPerformanceTableProps {
  data: SupplierPerformance[];
  isLoading?: boolean;
}

export function SupplierPerformanceTable({ data, isLoading }: SupplierPerformanceTableProps) {
  const handleExport = () => {
    const csv = [
      ['Supplier', 'Total Orders', 'Delivered', 'Delivery Rate', 'Avg Delivery Days', 'Total Amount'],
      ...data.map((item) => [
        item.name,
        item.totalOrders.toString(),
        item.deliveredOrders.toString(),
        item.totalOrders > 0
          ? `${Math.round((item.deliveredOrders / item.totalOrders) * 100)}%`
          : 'N/A',
        item.avgDeliveryDays.toString(),
        `$${item.totalAmount.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'supplier-performance.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const getDeliveryRateBadge = (rate: number) => {
    if (rate >= 90) {
      return <Badge className="bg-[hsl(var(--in-stock))] text-[hsl(var(--in-stock-foreground))]">Excellent</Badge>;
    } else if (rate >= 70) {
      return <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">Good</Badge>;
    } else if (rate >= 50) {
      return <Badge variant="outline">Average</Badge>;
    } else {
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Supplier Performance
          </CardTitle>
          <CardDescription>Delivery metrics and order history by supplier</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-muted-foreground">No supplier data available</div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-center">Total Orders</TableHead>
                  <TableHead className="text-center">Delivered</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                  <TableHead className="text-center">Avg Days</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const deliveryRate =
                    item.totalOrders > 0
                      ? Math.round((item.deliveredOrders / item.totalOrders) * 100)
                      : 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.totalOrders}</TableCell>
                      <TableCell className="text-center">{item.deliveredOrders}</TableCell>
                      <TableCell className="text-center">
                        {item.totalOrders > 0 ? getDeliveryRateBadge(deliveryRate) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.avgDeliveryDays > 0 ? `${item.avgDeliveryDays} days` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
