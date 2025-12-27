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
import { Download, AlertTriangle } from 'lucide-react';
import { ExpiryLossData } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';

interface ExpiryLossTableProps {
  data: ExpiryLossData[];
  isLoading?: boolean;
}

export function ExpiryLossTable({ data, isLoading }: ExpiryLossTableProps) {
  const totalPotentialLoss = data.reduce((sum, item) => sum + item.potentialLoss, 0);

  const handleExport = () => {
    const csv = [
      ['Medicine', 'Quantity', 'Unit Price', 'Expiry Date', 'Days Until Expiry', 'Potential Loss'],
      ...data.map((item) => [
        item.name,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        item.expiryDate,
        item.daysUntilExpiry.toString(),
        `$${item.potentialLoss.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'expiry-loss-prediction.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const getSeverityBadge = (days: number) => {
    if (days <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (days <= 7) {
      return <Badge className="bg-[hsl(var(--critical))] text-[hsl(var(--critical-foreground))]">Critical</Badge>;
    } else if (days <= 14) {
      return <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">Warning</Badge>;
    } else {
      return <Badge variant="outline">Soon</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
            Near-Expiry Loss Prediction
          </CardTitle>
          <CardDescription>
            Items expiring within 30 days • Total potential loss:{' '}
            <span className="font-semibold text-[hsl(var(--critical))]">
              ${totalPotentialLoss.toLocaleString()}
            </span>
          </CardDescription>
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
            <div className="text-muted-foreground">No items expiring within 30 days</div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-center">Expiry Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Potential Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      {format(parseISO(item.expiryDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getSeverityBadge(item.daysUntilExpiry)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[hsl(var(--critical))]">
                      ${item.potentialLoss.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
