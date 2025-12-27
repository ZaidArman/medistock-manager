import { Package, AlertTriangle, Clock, DollarSign, TrendingUp, Pill } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { StockChart } from '@/components/dashboard/StockChart';
import { mockMedicines, mockAlerts, mockStockMovements, mockDashboardStats } from '@/data/mockData';

export default function Dashboard() {
  const stats = mockDashboardStats;

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back, John. Here's your inventory overview."
    >
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={<Pill className="h-5 w-5 text-primary" />}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Total Stock"
          value={`${stats.totalStock.toLocaleString()} units`}
          icon={<Package className="h-5 w-5 text-primary" />}
          variant="success"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />}
          variant="warning"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoonItems}
          icon={<Clock className="h-5 w-5 text-[hsl(var(--critical))]" />}
          variant="critical"
        />
      </div>

      {/* Secondary Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Today's Sales"
          value={`$${stats.todaysSales.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard
          title="Total Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Expired Items"
          value={stats.expiredItems}
          icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--expired))]" />}
          variant="critical"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StockChart medicines={mockMedicines} />
        <AlertsPanel alerts={mockAlerts} />
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <RecentActivity movements={mockStockMovements} />
      </div>
    </DashboardLayout>
  );
}
