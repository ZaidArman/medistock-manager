import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'lucide-react';
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
import { Medicine } from '@/types/medicine';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StockOperationFormProps {
  type: 'stock-in' | 'stock-out';
  medicines: Medicine[];
}

export function StockOperationForm({ type, medicines }: StockOperationFormProps) {
  const { toast } = useToast();
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isStockIn = type === 'stock-in';
  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine || quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a medicine and enter a valid quantity.',
        variant: 'destructive',
      });
      return;
    }

    if (!isStockIn && selectedMedicineData && quantity > selectedMedicineData.quantity) {
      toast({
        title: 'Insufficient Stock',
        description: `Cannot remove ${quantity} units. Only ${selectedMedicineData.quantity} available.`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: isStockIn ? 'Stock Added' : 'Stock Removed',
      description: `Successfully ${isStockIn ? 'added' : 'removed'} ${quantity} units of ${selectedMedicineData?.name}.`,
    });

    // Reset form
    setSelectedMedicine('');
    setQuantity(0);
    setBatchNumber('');
    setReason('');
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
                {filteredMedicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{medicine.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Stock: {medicine.quantity}
                      </span>
                    </div>
                  </SelectItem>
                ))}
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
                  <p className="font-semibold text-foreground">{selectedMedicineData.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Batch</p>
                  <p className="font-mono font-semibold text-foreground">{selectedMedicineData.batchNumber}</p>
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
              {selectedMedicineData && (
                <p className="text-xs text-muted-foreground">
                  {isStockIn 
                    ? `New total: ${selectedMedicineData.quantity + quantity} units`
                    : `Remaining: ${selectedMedicineData.quantity - quantity} units`}
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
            >
              {isStockIn ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
