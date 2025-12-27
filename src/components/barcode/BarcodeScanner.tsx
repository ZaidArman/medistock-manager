import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Keyboard, AlertCircle, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string, productInfo?: ProductInfo | null) => void;
}

export interface ProductInfo {
  name?: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    setIsLookingUp(true);
    try {
      // Try Open Food Facts API first (good for OTC medicines and supplements)
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return {
          name: data.product.product_name || undefined,
          genericName: data.product.generic_name || undefined,
          manufacturer: data.product.brands || undefined,
          category: data.product.categories?.split(',')[0]?.trim() || undefined,
        };
      }
      return null;
    } catch (err) {
      console.log('Product lookup failed:', err);
      return null;
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleScan = useCallback(async (barcode: string) => {
    const productInfo = await lookupProduct(barcode);
    onScan(barcode, productInfo);
    stopScanner();
    onClose();
  }, [onScan, onClose]);

  const startScanner = async () => {
    setError(null);
    if (!containerRef.current) return;

    try {
      scannerRef.current = new Html5Qrcode('barcode-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // QR code not found - ignore
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      setError(err.message || 'Failed to start camera. Please try manual entry.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      await handleScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setManualBarcode('');
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
          <DialogDescription>
            Scan a medicine barcode or enter it manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div 
              id="barcode-reader" 
              ref={containerRef}
              className="relative overflow-hidden rounded-lg bg-muted"
              style={{ minHeight: 250 }}
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isScanning ? (
              <Button onClick={startScanner} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode Number</Label>
                <Input
                  id="barcode"
                  placeholder="Enter barcode (e.g., 8901234567890)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={!manualBarcode.trim() || isLookingUp}>
                {isLookingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  'Submit Barcode'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {isLookingUp && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Looking up product information...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
