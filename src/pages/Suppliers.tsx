import { useState } from 'react';
import { Truck, Plus, Phone, Mail, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  lastOrder: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'PharmaCorp Ltd',
    contactPerson: 'Michael Brown',
    email: 'orders@pharmacorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Drive, Healthcare City, HC 12345',
    status: 'active',
    lastOrder: '2024-12-20',
  },
  {
    id: '2',
    name: 'MedLife Pharma',
    contactPerson: 'Sarah Wilson',
    email: 'supply@medlife.com',
    phone: '+1 (555) 234-5678',
    address: '456 Pharma Avenue, Medicine Town, MT 67890',
    status: 'active',
    lastOrder: '2024-12-18',
  },
  {
    id: '3',
    name: 'HealthFirst Inc',
    contactPerson: 'David Lee',
    email: 'orders@healthfirst.com',
    phone: '+1 (555) 345-6789',
    address: '789 Wellness Blvd, Health City, HC 11223',
    status: 'inactive',
    lastOrder: '2024-11-05',
  },
];

export default function Suppliers() {
  const { toast } = useToast();
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const handleAddSupplier = () => {
    toast({
      title: 'Add Supplier',
      description: 'Supplier management form will be available soon.',
    });
  };

  const handleCreateOrder = (supplier: Supplier) => {
    toast({
      title: 'Create Purchase Order',
      description: `Starting new order with ${supplier.name}.`,
    });
  };

  return (
    <DashboardLayout 
      title="Suppliers" 
      subtitle="Manage suppliers and purchase orders"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Supplier Directory
          </CardTitle>
          <Button onClick={handleAddSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="border-border">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                    </div>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      Last order: {new Date(supplier.lastOrder).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateOrder(supplier)}
                      disabled={supplier.status === 'inactive'}
                    >
                      New Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
