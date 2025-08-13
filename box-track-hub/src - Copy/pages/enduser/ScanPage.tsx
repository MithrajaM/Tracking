import { useState } from 'react';
import { RFIDScanner } from '@/components/RFIDScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Box } from '@/types';
import { useNavigate } from 'react-router-dom';
import { boxAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const ScanPage = () => {
  const [scannedBox, setScannedBox] = useState<Box | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock box data for demo
  const mockBoxes: Record<string, Box> = {
    'BOX001': {
      id: '1',
      boxId: 'BOX001',
      status: 'in-use',
      usageCount: 5,
      maxUsage: 20,
      createdAt: '2024-01-15',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Warehouse A'
    },
    'BOX002': {
      id: '2',
      boxId: 'BOX002',
      status: 'new',
      usageCount: 0,
      maxUsage: 20,
      createdAt: '2024-01-20',
      manufacturer: 'GreenPack Co.',
      currentLocation: 'Distribution Center'
    },
    'BOX003': {
      id: '3',
      boxId: 'BOX003',
      status: 'retired',
      usageCount: 20,
      maxUsage: 20,
      createdAt: '2024-01-10',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Recycling Center'
    },
    'BOX004': {
      id: '4',
      boxId: 'BOX004',
      status: 'in-use',
      usageCount: 18,
      maxUsage: 20,
      createdAt: '2024-01-12',
      manufacturer: 'SustainBox Inc.',
      currentLocation: 'Warehouse B'
    },
    'BOX005': {
      id: '5',
      boxId: 'BOX005',
      status: 'damaged',
      usageCount: 8,
      maxUsage: 25,
      createdAt: '2024-01-18',
      manufacturer: 'GreenPack Co.',
      currentLocation: 'Repair Center'
    }
  };

  const handleScan = async (boxId: string) => {
    setLoading(true);
    setNotFound(false);
    setScannedBox(null);

    // Check if we're in demo mode (no real API token)
    const token = localStorage.getItem('authToken');
    const isDemoMode = !token || token.startsWith('demo-token-');

    if (isDemoMode) {
      // Use mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const box = mockBoxes[boxId.toUpperCase()];
      if (box) {
        setScannedBox(box);
        toast({
          title: "Box Found",
          description: `Box ${boxId} loaded successfully (Demo Mode)`,
        });
      } else {
        setNotFound(true);
        toast({
          title: "Box Not Found",
          description: `Box ${boxId} not found. Try: BOX001, BOX002, BOX003, BOX004, or BOX005`,
          variant: "destructive",
        });
      }
    } else {
      // Use real API
      try {
        const response = await boxAPI.getBox(boxId);
        setScannedBox(response.data.box);

        toast({
          title: "Box Found",
          description: `Box ${boxId} loaded successfully`,
        });
      } catch (error: any) {
        setNotFound(true);
        const message = error.response?.data?.message || 'Box not found';

        toast({
          title: "Box Not Found",
          description: message,
          variant: "destructive",
        });
      }
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-success text-success-foreground';
      case 'in-use': return 'bg-primary text-primary-foreground';
      case 'damaged': return 'bg-destructive text-destructive-foreground';
      case 'retired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const canDeliver = (box: Box) => {
    return box.status !== 'retired' && box.status !== 'damaged';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Scan Box</h1>
        <p className="text-muted-foreground">
          Scan an RFID tag or enter Box ID to track delivery
        </p>
      </div>

      <RFIDScanner onScan={handleScan} />

      {loading && (
        <Card className="animate-slide-up">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Looking up box information...</span>
          </CardContent>
        </Card>
      )}

      {scannedBox && (
        <Card className="animate-slide-up shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Box {scannedBox.boxId}
              </CardTitle>
              <Badge className={getStatusColor(scannedBox.status)}>
                {scannedBox.status}
              </Badge>
            </div>
            <CardDescription>
              Manufactured by {scannedBox.manufacturer}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Usage Count:</span>
                <p className="font-medium">{scannedBox.usageCount} / {scannedBox.maxUsage}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">{new Date(scannedBox.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Current Location:</span>
                <p className="font-medium">{scannedBox.currentLocation}</p>
              </div>
            </div>

            {canDeliver(scannedBox) ? (
              <Button 
                onClick={() => navigate(`/deliver/${scannedBox.boxId}`)}
                variant="success"
                size="lg"
                className="w-full"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Delivered
              </Button>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Box Retired</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This box has reached its maximum usage and cannot be used for deliveries.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Card className="animate-slide-up border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Box Not Found
            </CardTitle>
            <CardDescription>
              The scanned box ID was not found in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/add-box')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Box
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};