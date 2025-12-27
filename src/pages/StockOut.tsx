import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StockOperationForm } from '@/components/stock/StockOperationForm';

export default function StockOut() {
  return (
    <DashboardLayout 
      title="Stock Out" 
      subtitle="Remove stock from inventory"
    >
      <StockOperationForm type="stock-out" />
    </DashboardLayout>
  );
}
