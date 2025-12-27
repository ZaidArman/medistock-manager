import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MedicineTable } from '@/components/medicines/MedicineTableEnhanced';
import { MedicineFormDialog } from '@/components/medicines/MedicineFormDialog';
import { useMedicines, DbMedicine, MedicineFormData } from '@/hooks/useMedicines';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Medicines() {
  const { toast } = useToast();
  const { addMedicine, updateMedicine, deleteMedicine, refetch } = useMedicines();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<DbMedicine | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<DbMedicine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setDialogOpen(true);
  };

  const handleEdit = (medicine: DbMedicine) => {
    setSelectedMedicine(medicine);
    setDialogOpen(true);
  };

  const handleDeleteClick = (medicine: DbMedicine) => {
    setMedicineToDelete(medicine);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicineToDelete) return;
    
    setIsSubmitting(true);
    await deleteMedicine(medicineToDelete.id, medicineToDelete.name);
    setDeleteDialogOpen(false);
    setMedicineToDelete(null);
    setIsSubmitting(false);
  };

  const handleView = (medicine: DbMedicine) => {
    toast({
      title: medicine.name,
      description: `Batch: ${medicine.batch_number} | Location: ${medicine.location || 'N/A'}`,
    });
  };

  const handleSubmit = async (data: MedicineFormData) => {
    setIsSubmitting(true);
    
    let success: boolean;
    if (selectedMedicine) {
      success = await updateMedicine(selectedMedicine.id, data);
    } else {
      success = await addMedicine(data);
    }
    
    if (success) {
      setDialogOpen(false);
      await refetch();
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout 
      title="Medicines" 
      subtitle="Manage your medicine inventory"
    >
      <MedicineTable 
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
      />
      
      <MedicineFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        medicine={selectedMedicine}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{medicineToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
