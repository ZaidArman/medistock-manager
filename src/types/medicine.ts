export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  expiryDate: string;
  location: string;
  barcode?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'expiring-soon';
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'stock-in' | 'stock-out';
  quantity: number;
  batchNumber: string;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'expiry' | 'low-stock' | 'out-of-stock' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  medicineId?: string;
  medicineName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalMedicines: number;
  totalStock: number;
  lowStockItems: number;
  expiringSoonItems: number;
  expiredItems: number;
  todaysSales: number;
  totalValue: number;
}

export type UserRole = 'admin' | 'pharmacist' | 'store-manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
