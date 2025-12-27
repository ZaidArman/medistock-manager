import { useState } from 'react';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { StockTrendsChart } from '@/components/analytics/StockTrendsChart';
import { CategoryDistributionChart } from '@/components/analytics/CategoryDistributionChart';
import { MovingItemsChart } from '@/components/analytics/MovingItemsChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ExpiryLossTable } from '@/components/analytics/ExpiryLossTable';
import { SupplierPerformanceTable } from '@/components/analytics/SupplierPerformanceTable';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const analytics = useAnalytics({
    from: dateRange?.from || subDays(new Date(), 30),
    to: dateRange?.to || new Date(),
  });

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Advanced inventory analytics and insights"
    >
      <div className="mb-6 flex items-center justify-between">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StockTrendsChart
          data={analytics.stockTrends.data || []}
          isLoading={analytics.stockTrends.isLoading}
        />
        <CategoryDistributionChart
          data={analytics.categoryDistribution.data || []}
          isLoading={analytics.categoryDistribution.isLoading}
        />
        <MovingItemsChart
          data={analytics.movingItems.data || []}
          isLoading={analytics.movingItems.isLoading}
        />
        <RevenueChart
          data={analytics.revenueData.data || []}
          isLoading={analytics.revenueData.isLoading}
        />
      </div>

      <div className="mt-6 space-y-6">
        <ExpiryLossTable
          data={analytics.expiryLoss.data || []}
          isLoading={analytics.expiryLoss.isLoading}
        />
        <SupplierPerformanceTable
          data={analytics.supplierPerformance.data || []}
          isLoading={analytics.supplierPerformance.isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
