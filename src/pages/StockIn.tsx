import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StockOperationForm } from '@/components/stock/StockOperationForm';
import { mockMedicines } from '@/data/mockData';

export default function StockIn() {
  return (
    <DashboardLayout 
      title="Stock In" 
      subtitle="Add new stock to inventory"
    >
      <StockOperationForm type="stock-in" medicines={mockMedicines} />
    </DashboardLayout>
  );
}
