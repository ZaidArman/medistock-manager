import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockChart } from '@/components/dashboard/StockChart';
import { mockMedicines, mockStockMovements, mockDashboardStats } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Reports() {
  const { toast } = useToast();
  const stats = mockDashboardStats;

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Export to ${format.toUpperCase()}`,
      description: 'Your report is being generated and will download shortly.',
    });
  };

  return (
    <DashboardLayout 
      title="Reports" 
      subtitle="Generate and export inventory reports"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Inventory Summary
            </CardTitle>
            <CardDescription>Current inventory status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMedicines}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStock.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold text-foreground">${stats.todaysSales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Export Reports
            </CardTitle>
            <CardDescription>Download inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExport('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExport('pdf')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stock Chart */}
      <div className="mt-6">
        <StockChart medicines={mockMedicines} className="h-auto" />
      </div>

      {/* Recent Movements */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Stock Movement History
          </CardTitle>
          <CardDescription>Recent stock transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Medicine</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {mockStockMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm text-foreground">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm font-medium text-foreground">
                      {movement.medicineName}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        movement.type === 'stock-in' 
                          ? 'bg-[hsl(var(--in-stock))]/10 text-[hsl(var(--in-stock))]'
                          : 'bg-[hsl(var(--low-stock))]/10 text-[hsl(var(--low-stock))]'
                      }`}>
                        {movement.type === 'stock-in' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-semibold text-foreground">
                      {movement.type === 'stock-in' ? '+' : '-'}{movement.quantity}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {movement.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
