import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, PieChart as PieChartIcon } from 'lucide-react';
import { CategoryDistribution } from '@/hooks/useAnalytics';

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
  isLoading?: boolean;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--in-stock))',
  'hsl(var(--warning))',
  'hsl(var(--low-stock))',
  'hsl(var(--critical))',
  'hsl(var(--muted-foreground))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
];

export function CategoryDistributionChart({ data, isLoading }: CategoryDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (chartRef.current) {
      const svg = chartRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = svg.clientWidth * 2;
        canvas.height = svg.clientHeight * 2;
        
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const link = document.createElement('a');
          link.download = 'category-distribution.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Category Distribution
          </CardTitle>
          <CardDescription>Medicine count by category</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                          <p className="font-medium text-foreground">{item.category}</p>
                          <p className="text-sm text-muted-foreground">
                            Items: {item.count}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Value: ${item.value.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
