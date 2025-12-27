import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbMedicine {
  id: string;
  name: string;
  generic_name: string | null;
  category: string;
  manufacturer: string | null;
  batch_number: string;
  quantity: number;
  min_stock_level: number;
  unit_price: number;
  expiry_date: string;
  location: string | null;
  barcode: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineFormData {
  name: string;
  generic_name?: string;
  category: string;
  manufacturer?: string;
  batch_number: string;
  quantity: number;
  min_stock_level: number;
  unit_price: number;
  expiry_date: string;
  location?: string;
  barcode?: string;
}

interface UseMedicinesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  categoryFilter?: string;
  statusFilter?: string;
}

export function useMedicines(options: UseMedicinesOptions = {}) {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<DbMedicine[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    page = 1,
    pageSize = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    searchTerm = '',
    categoryFilter = 'all',
    statusFilter = 'all',
  } = options;

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('medicines')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,batch_number.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setMedicines(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch medicines';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchTerm, categoryFilter, statusFilter, toast]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const addMedicine = async (data: MedicineFormData): Promise<boolean> => {
    try {
      const { error } = await supabase.from('medicines').insert({
        name: data.name,
        generic_name: data.generic_name || null,
        category: data.category,
        manufacturer: data.manufacturer || null,
        batch_number: data.batch_number,
        quantity: data.quantity,
        min_stock_level: data.min_stock_level,
        unit_price: data.unit_price,
        expiry_date: data.expiry_date,
        location: data.location || null,
        barcode: data.barcode || null,
        status: calculateStatus(data.quantity, data.min_stock_level, data.expiry_date),
      });

      if (error) throw error;

      toast({
        title: 'Medicine Added',
        description: `${data.name} has been added to inventory.`,
      });

      await fetchMedicines();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add medicine';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateMedicine = async (id: string, data: Partial<MedicineFormData>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = { ...data };
      
      // Recalculate status if relevant fields changed
      if (data.quantity !== undefined || data.min_stock_level !== undefined || data.expiry_date !== undefined) {
        const current = medicines.find(m => m.id === id);
        if (current) {
          updateData.status = calculateStatus(
            data.quantity ?? current.quantity,
            data.min_stock_level ?? current.min_stock_level,
            data.expiry_date ?? current.expiry_date
          );
        }
      }

      const { error } = await supabase
        .from('medicines')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Medicine Updated',
        description: `${data.name || 'Medicine'} has been updated.`,
      });

      await fetchMedicines();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update medicine';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMedicine = async (id: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Medicine Deleted',
        description: `${name} has been removed from inventory.`,
      });

      await fetchMedicines();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete medicine';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    medicines,
    totalCount,
    isLoading,
    error,
    refetch: fetchMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
  };
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
