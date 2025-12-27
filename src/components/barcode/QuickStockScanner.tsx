import { useState } from 'react';
import { Scan, Package, PackageMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeScanner, ProductInfo } from './BarcodeScanner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStockOperations } from '@/hooks/useStockOperations';

interface Medicine {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number;
  batch_number: string;
}

interface QuickStockScannerProps {
  open: boolean;
  onClose: () => void;
  type: 'stock-in' | 'stock-out';
  onComplete?: () => void;
}

export function QuickStockScanner({ open, onClose, type, onComplete }: QuickStockScannerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { performStockOperation } = useStockOperations();

  const handleScan = async (barcode: string, _productInfo?: ProductInfo | null) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, barcode, quantity, batch_number')
        .eq('barcode', barcode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMedicine(data);
        setShowScanner(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Medicine not found',
          description: `No medicine found with barcode: ${barcode}. Please add it first.`,
        });
      }
    } catch (err) {
      console.error('Error searching medicine:', err);
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: 'Failed to search for medicine.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!medicine || !quantity) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity.',
      });
      return;
    }

    if (type === 'stock-out' && qty > medicine.quantity) {
      toast({
        variant: 'destructive',
        title: 'Insufficient stock',
        description: `Only ${medicine.quantity} units available.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await performStockOperation({
        medicineId: medicine.id,
        quantity: qty,
        batchNumber: medicine.batch_number,
        reason: reason || `Quick ${type} via barcode`,
        type,
      });

      if (!success) {
        setIsLoading(false);
        return;
      }

      // Reset and close
      setMedicine(null);
      setQuantity('1');
      setReason('');
      onComplete?.();
      onClose();
    } catch (err) {
      console.error('Stock operation failed:', err);
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: 'Failed to update stock.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMedicine(null);
    setQuantity('1');
    setReason('');
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showScanner} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {type === 'stock-in' ? (
                <Package className="h-5 w-5 text-[hsl(var(--in-stock))]" />
              ) : (
                <PackageMinus className="h-5 w-5 text-[hsl(var(--low-stock))]" />
              )}
              Quick {type === 'stock-in' ? 'Stock In' : 'Stock Out'}
            </DialogTitle>
            <DialogDescription>
              Scan a barcode to quickly {type === 'stock-in' ? 'add' : 'remove'} stock
            </DialogDescription>
          </DialogHeader>

          {!medicine ? (
            <div className="space-y-4">
              <Button 
                onClick={() => setShowScanner(true)} 
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Scan className="mr-2 h-4 w-4" />
                )}
                {isSearching ? 'Searching...' : 'Scan Barcode'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{medicine.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Current stock: <span className="font-semibold text-foreground">{medicine.quantity}</span> units
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Batch: <span className="font-semibold text-foreground">{medicine.batch_number}</span>
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={type === 'stock-out' ? medicine.quantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Restock, Sale, Damaged"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMedicine(null)}
                >
                  Scan Another
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {type === 'stock-in' ? 'Add Stock' : 'Remove Stock'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />
    </>
  );
}
