import { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Medicine } from '@/types/medicine';
import { categories } from '@/data/mockData';

interface MedicineTableProps {
  medicines: Medicine[];
  onAddNew?: () => void;
  onEdit?: (medicine: Medicine) => void;
  onDelete?: (medicine: Medicine) => void;
  onView?: (medicine: Medicine) => void;
}

export function MedicineTable({ 
  medicines, 
  onAddNew, 
  onEdit, 
  onDelete,
  onView 
}: MedicineTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || medicine.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Medicine Inventory</CardTitle>
          <Button onClick={onAddNew} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, generic name, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Medicine</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="hidden lg:table-cell">Batch</TableHead>
                <TableHead className="hidden lg:table-cell">Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No medicines found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{medicine.genericName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {medicine.category}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{medicine.quantity}</p>
                        <p className="text-xs text-muted-foreground">Min: {medicine.minStockLevel}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                      {medicine.batchNumber}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {new Date(medicine.expiryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={medicine.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(medicine)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(medicine)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(medicine)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredMedicines.length} of {medicines.length} medicines</span>
        </div>
      </CardContent>
    </Card>
  );
}
