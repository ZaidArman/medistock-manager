import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MedicineTable } from '@/components/medicines/MedicineTable';
import { MedicineFormDialog } from '@/components/medicines/MedicineFormDialog';
import { mockMedicines } from '@/data/mockData';
import { Medicine } from '@/types/medicine';
import { useToast } from '@/hooks/use-toast';

export default function Medicines() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setDialogOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDialogOpen(true);
  };

  const handleDelete = (medicine: Medicine) => {
    setMedicines(prev => prev.filter(m => m.id !== medicine.id));
    toast({
      title: 'Medicine Deleted',
      description: `${medicine.name} has been removed from inventory.`,
    });
  };

  const handleView = (medicine: Medicine) => {
    toast({
      title: medicine.name,
      description: `Batch: ${medicine.batchNumber} | Location: ${medicine.location}`,
    });
  };

  const handleSubmit = (data: Partial<Medicine>) => {
    if (selectedMedicine) {
      // Edit existing
      setMedicines(prev => 
        prev.map(m => m.id === selectedMedicine.id 
          ? { ...m, ...data, updatedAt: new Date().toISOString() } 
          : m
        )
      );
      toast({
        title: 'Medicine Updated',
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      // Add new
      const newMedicine: Medicine = {
        id: String(Date.now()),
        name: data.name || '',
        genericName: data.genericName || '',
        category: data.category || '',
        manufacturer: data.manufacturer || '',
        batchNumber: data.batchNumber || '',
        quantity: data.quantity || 0,
        minStockLevel: data.minStockLevel || 0,
        unitPrice: data.unitPrice || 0,
        expiryDate: data.expiryDate || '',
        location: data.location || '',
        barcode: data.barcode,
        status: 'in-stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMedicines(prev => [newMedicine, ...prev]);
      toast({
        title: 'Medicine Added',
        description: `${data.name} has been added to inventory.`,
      });
    }
  };

  return (
    <DashboardLayout 
      title="Medicines" 
      subtitle="Manage your medicine inventory"
    >
      <MedicineTable 
        medicines={medicines}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
      
      <MedicineFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        medicine={selectedMedicine}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
