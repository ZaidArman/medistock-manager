import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format, parseISO, differenceInDays } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

export interface StockTrendData {
  date: string;
  stockIn: number;
  stockOut: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  value: number;
}

export interface MovingItem {
  id: string;
  name: string;
  totalMovement: number;
  movementType: 'fast' | 'slow';
}

export interface ExpiryLossData {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  daysUntilExpiry: number;
  potentialLoss: number;
}

export interface SupplierPerformance {
  id: string;
  name: string;
  totalOrders: number;
  deliveredOrders: number;
  avgDeliveryDays: number;
  totalAmount: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  inventoryCost: number;
}

export function useAnalytics(dateRange: DateRange) {
  // Stock consumption trends
  const stockTrends = useQuery({
    queryKey: ['analytics', 'stockTrends', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, { stockIn: number; stockOut: number }> = {};
      
      data?.forEach((movement) => {
        const date = format(parseISO(movement.created_at), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = { stockIn: 0, stockOut: 0 };
        }
        if (movement.type === 'stock-in') {
          grouped[date].stockIn += movement.quantity;
        } else {
          grouped[date].stockOut += movement.quantity;
        }
      });

      // Fill in missing dates
      const result: StockTrendData[] = [];
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(dateRange.to, days - 1 - i), 'yyyy-MM-dd');
        result.push({
          date,
          stockIn: grouped[date]?.stockIn || 0,
          stockOut: grouped[date]?.stockOut || 0,
        });
      }

      return result;
    },
  });

  // Category distribution
  const categoryDistribution = useQuery({
    queryKey: ['analytics', 'categoryDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('category, quantity, unit_price');

      if (error) throw error;

      const grouped: Record<string, { count: number; value: number }> = {};
      
      data?.forEach((med) => {
        if (!grouped[med.category]) {
          grouped[med.category] = { count: 0, value: 0 };
        }
        grouped[med.category].count += 1;
        grouped[med.category].value += med.quantity * med.unit_price;
      });

      return Object.entries(grouped).map(([category, { count, value }]) => ({
        category,
        count,
        value,
      }));
    },
  });

  // Fast vs slow moving items
  const movingItems = useQuery({
    queryKey: ['analytics', 'movingItems', dateRange],
    queryFn: async () => {
      const { data: movements, error: movementsError } = await supabase
        .from('stock_movements')
        .select('medicine_id, quantity, type')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (movementsError) throw movementsError;

      const { data: medicines, error: medicinesError } = await supabase
        .from('medicines')
        .select('id, name');

      if (medicinesError) throw medicinesError;

      // Calculate total movement per medicine
      const movementMap: Record<string, number> = {};
      
      movements?.forEach((m) => {
        if (!movementMap[m.medicine_id]) {
          movementMap[m.medicine_id] = 0;
        }
        movementMap[m.medicine_id] += m.quantity;
      });

      // Create sorted list
      const items: MovingItem[] = medicines
        ?.filter((med) => movementMap[med.id] !== undefined)
        .map((med) => ({
          id: med.id,
          name: med.name,
          totalMovement: movementMap[med.id] || 0,
          movementType: 'fast' as const,
        }))
        .sort((a, b) => b.totalMovement - a.totalMovement) || [];

      // Mark bottom half as slow moving
      const midpoint = Math.floor(items.length / 2);
      items.forEach((item, index) => {
        if (index >= midpoint) {
          item.movementType = 'slow';
        }
      });

      return items;
    },
  });

  // Expiry loss prediction
  const expiryLoss = useQuery({
    queryKey: ['analytics', 'expiryLoss'],
    queryFn: async () => {
      const thirtyDaysFromNow = format(subDays(new Date(), -30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, quantity, unit_price, expiry_date')
        .lte('expiry_date', thirtyDaysFromNow)
        .gt('quantity', 0)
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      return data?.map((med) => {
        const daysUntilExpiry = differenceInDays(parseISO(med.expiry_date), new Date());
        return {
          id: med.id,
          name: med.name,
          quantity: med.quantity,
          unitPrice: med.unit_price,
          expiryDate: med.expiry_date,
          daysUntilExpiry,
          potentialLoss: med.quantity * med.unit_price,
        };
      }) || [];
    },
  });

  // Supplier performance
  const supplierPerformance = useQuery({
    queryKey: ['analytics', 'supplierPerformance'],
    queryFn: async () => {
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name');

      if (suppliersError) throw suppliersError;

      const { data: orders, error: ordersError } = await supabase
        .from('purchase_orders')
        .select('supplier_id, status, total_amount, created_at, delivered_date, expected_date');

      if (ordersError) throw ordersError;

      return suppliers?.map((supplier) => {
        const supplierOrders = orders?.filter((o) => o.supplier_id === supplier.id) || [];
        const deliveredOrders = supplierOrders.filter((o) => o.status === 'delivered');
        
        // Calculate average delivery time
        let totalDeliveryDays = 0;
        let deliveryCount = 0;
        
        deliveredOrders.forEach((order) => {
          if (order.delivered_date && order.created_at) {
            const days = differenceInDays(
              parseISO(order.delivered_date),
              parseISO(order.created_at)
            );
            totalDeliveryDays += days;
            deliveryCount += 1;
          }
        });

        return {
          id: supplier.id,
          name: supplier.name,
          totalOrders: supplierOrders.length,
          deliveredOrders: deliveredOrders.length,
          avgDeliveryDays: deliveryCount > 0 ? Math.round(totalDeliveryDays / deliveryCount) : 0,
          totalAmount: supplierOrders.reduce((sum, o) => sum + o.total_amount, 0),
        };
      }) || [];
    },
  });

  // Revenue data
  const revenueData = useQuery({
    queryKey: ['analytics', 'revenueData', dateRange],
    queryFn: async () => {
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('created_at, total_amount')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (salesError) throw salesError;

      // Get inventory cost (approximate from medicines value)
      const { data: medicines, error: medicinesError } = await supabase
        .from('medicines')
        .select('quantity, unit_price');

      if (medicinesError) throw medicinesError;

      const totalInventoryCost = medicines?.reduce(
        (sum, med) => sum + med.quantity * med.unit_price,
        0
      ) || 0;

      // Group sales by date
      const grouped: Record<string, number> = {};
      
      sales?.forEach((sale) => {
        const date = format(parseISO(sale.created_at), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = 0;
        }
        grouped[date] += sale.total_amount;
      });

      // Create result with inventory cost distributed evenly
      const result: RevenueData[] = [];
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const dailyInventoryCost = totalInventoryCost / days;

      for (let i = 0; i < days; i++) {
        const date = format(subDays(dateRange.to, days - 1 - i), 'yyyy-MM-dd');
        result.push({
          date,
          revenue: grouped[date] || 0,
          inventoryCost: Math.round(dailyInventoryCost * 100) / 100,
        });
      }

      return result;
    },
  });

  // Dashboard stats
  const dashboardStats = useQuery({
    queryKey: ['analytics', 'dashboardStats'],
    queryFn: async () => {
      const { data: medicines, error: medicinesError } = await supabase
        .from('medicines')
        .select('quantity, unit_price, status, expiry_date, min_stock_level');

      if (medicinesError) throw medicinesError;

      const today = format(new Date(), 'yyyy-MM-dd');
      const thirtyDaysFromNow = format(subDays(new Date(), -30), 'yyyy-MM-dd');

      const totalMedicines = medicines?.length || 0;
      const totalStock = medicines?.reduce((sum, m) => sum + m.quantity, 0) || 0;
      const totalValue = medicines?.reduce((sum, m) => sum + m.quantity * m.unit_price, 0) || 0;
      const lowStockItems = medicines?.filter((m) => m.quantity < m.min_stock_level && m.quantity > 0).length || 0;
      const expiredItems = medicines?.filter((m) => m.expiry_date <= today).length || 0;
      const expiringSoonItems = medicines?.filter(
        (m) => m.expiry_date > today && m.expiry_date <= thirtyDaysFromNow
      ).length || 0;

      // Get today's sales
      const startOfToday = startOfDay(new Date()).toISOString();
      const endOfToday = endOfDay(new Date()).toISOString();

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday);

      if (salesError) throw salesError;

      const todaysSales = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;

      return {
        totalMedicines,
        totalStock,
        lowStockItems,
        expiringSoonItems,
        expiredItems,
        todaysSales,
        totalValue,
      };
    },
  });

  return {
    stockTrends,
    categoryDistribution,
    movingItems,
    expiryLoss,
    supplierPerformance,
    revenueData,
    dashboardStats,
  };
}
