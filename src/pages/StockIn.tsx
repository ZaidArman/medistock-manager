import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StockOperationForm } from '@/components/stock/StockOperationForm';

export default function StockIn() {
  return (
    <DashboardLayout 
      title="Stock In" 
      subtitle="Add new stock to inventory"
    >
      <StockOperationForm type="stock-in" />
    </DashboardLayout>
  );
}
