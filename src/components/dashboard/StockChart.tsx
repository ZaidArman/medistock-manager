import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Medicine } from '@/types/medicine';

interface StockChartProps {
  medicines: Medicine[];
  className?: string;
}

export function StockChart({ medicines, className }: StockChartProps) {
  const chartData = medicines.slice(0, 6).map(med => ({
    name: med.name.split(' ')[0],
    fullName: med.name,
    stock: med.quantity,
    minLevel: med.minStockLevel,
    status: med.status,
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'hsl(var(--critical))';
      case 'expiring-soon':
        return 'hsl(var(--warning))';
      case 'low-stock':
      case 'out-of-stock':
        return 'hsl(var(--low-stock))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Stock Levels by Medicine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                        <p className="font-medium text-foreground">{data.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: <span className="font-semibold text-foreground">{data.stock}</span> units
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Min Level: <span className="font-semibold text-foreground">{data.minLevel}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
