import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useStockOperations } from '@/hooks/useStockOperations';
import { cn } from '@/lib/utils';

interface DbMedicine {
  id: string;
  name: string;
  generic_name: string | null;
  quantity: number;
  location: string | null;
  batch_number: string;
}

interface StockOperationFormProps {
  type: 'stock-in' | 'stock-out';
}

export function StockOperationForm({ type }: StockOperationFormProps) {
  const { performStockOperation } = useStockOperations();
  const [medicines, setMedicines] = useState<DbMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isStockIn = type === 'stock-in';

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, generic_name, quantity, location, batch_number')
        .order('name');
      
      if (error) throw error;
      setMedicines(data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.generic_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine || quantity <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await performStockOperation({
      medicineId: selectedMedicine,
      quantity,
      batchNumber: batchNumber || undefined,
      reason,
      type,
    });

    if (success) {
      // Reset form and refresh medicines
      setSelectedMedicine('');
      setQuantity(0);
      setBatchNumber('');
      setReason('');
      await fetchMedicines();
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isStockIn 
              ? "bg-[hsl(var(--in-stock))]/10 text-[hsl(var(--in-stock))]"
              : "bg-[hsl(var(--low-stock))]/10 text-[hsl(var(--low-stock))]"
          )}>
            {isStockIn ? (
              <ArrowDownCircle className="h-5 w-5" />
            ) : (
              <ArrowUpCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <CardTitle>{isStockIn ? 'Stock In' : 'Stock Out'}</CardTitle>
            <CardDescription>
              {isStockIn 
                ? 'Add new stock to inventory' 
                : 'Remove stock from inventory'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="medicine">Select Medicine *</Label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Search and select medicine" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {filteredMedicines.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No medicines found
                    </div>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{medicine.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Stock: {medicine.quantity}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedMedicineData && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-2 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">Current Stock</p>
                    <p className="font-semibold text-foreground">{selectedMedicineData.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{selectedMedicineData.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Batch</p>
                    <p className="font-mono font-semibold text-foreground">{selectedMedicineData.batch_number}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity"
                  required
                />
                {selectedMedicineData && quantity > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {isStockIn 
                      ? `New total: ${selectedMedicineData.quantity + quantity} units`
                      : `Remaining: ${Math.max(0, selectedMedicineData.quantity - quantity)} units`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">
                  Batch Number {isStockIn && '*'}
                </Label>
                <Input
                  id="batchNumber"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., PC2024-002"
                  required={isStockIn}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Notes *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={isStockIn 
                  ? "e.g., Regular restock from supplier" 
                  : "e.g., Dispensed to patients"}
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedMedicine('');
                  setQuantity(0);
                  setBatchNumber('');
                  setReason('');
                }}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                className={cn(
                  "flex-1",
                  !isStockIn && "bg-[hsl(var(--low-stock))] hover:bg-[hsl(var(--low-stock))]/90"
                )}
                disabled={isSubmitting || !selectedMedicine || quantity <= 0 || !reason}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isStockIn ? 'Add Stock' : 'Remove Stock'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
