import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StockOperationData {
  medicineId: string;
  quantity: number;
  batchNumber?: string;
  reason: string;
  type: 'stock-in' | 'stock-out';
}

export function useStockOperations() {
  const { toast } = useToast();
  const { user } = useAuth();

  const performStockOperation = async (data: StockOperationData): Promise<boolean> => {
    try {
      // Get current medicine
      const { data: medicine, error: fetchError } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', data.medicineId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!medicine) throw new Error('Medicine not found');

      // Validate stock-out
      if (data.type === 'stock-out' && data.quantity > medicine.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Cannot remove ${data.quantity} units. Only ${medicine.quantity} available.`,
          variant: 'destructive',
        });
        return false;
      }

      // Calculate new quantity
      const newQuantity = data.type === 'stock-in'
        ? medicine.quantity + data.quantity
        : medicine.quantity - data.quantity;

      // Calculate new status
      const newStatus = calculateStatus(newQuantity, medicine.min_stock_level, medicine.expiry_date);

      // Update medicine quantity and batch number (for stock-in)
      const updateData: Record<string, unknown> = {
        quantity: newQuantity,
        status: newStatus,
      };

      if (data.type === 'stock-in' && data.batchNumber) {
        updateData.batch_number = data.batchNumber;
      }

      const { error: updateError } = await supabase
        .from('medicines')
        .update(updateData)
        .eq('id', data.medicineId);

      if (updateError) throw updateError;

      // Record stock movement
      const { error: movementError } = await supabase.from('stock_movements').insert({
        medicine_id: data.medicineId,
        type: data.type,
        quantity: data.quantity,
        batch_number: data.batchNumber || medicine.batch_number,
        reason: data.reason,
        performed_by: user?.id || null,
      });

      if (movementError) throw movementError;

      toast({
        title: data.type === 'stock-in' ? 'Stock Added' : 'Stock Removed',
        description: `Successfully ${data.type === 'stock-in' ? 'added' : 'removed'} ${data.quantity} units of ${medicine.name}.`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to perform stock operation';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return { performStockOperation };
}

function calculateStatus(quantity: number, minStockLevel: number, expiryDate: string): string {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= minStockLevel) return 'low-stock';
  return 'in-stock';
}
