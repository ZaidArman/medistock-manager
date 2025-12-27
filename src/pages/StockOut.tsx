import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StockOperationForm } from '@/components/stock/StockOperationForm';
import { mockMedicines } from '@/data/mockData';

export default function StockOut() {
  return (
    <DashboardLayout 
      title="Stock Out" 
      subtitle="Remove stock from inventory"
    >
      <StockOperationForm type="stock-out" medicines={mockMedicines} />
    </DashboardLayout>
  );
}
