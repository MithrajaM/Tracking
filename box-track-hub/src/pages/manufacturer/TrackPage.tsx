import { useState } from 'react';
import { RFIDScanner } from '@/components/RFIDScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Clock, AlertTriangle, Flag, Archive } from 'lucide-react';
import { Box, BoxHistory } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const TrackPage = () => {
  const [scannedBox, setScannedBox] = useState<Box | null>(null);
  const [boxHistory, setBoxHistory] = useState<BoxHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data
  const mockBoxes: Record<string, Box> = {
    'BOX001': {
      id: '1',
      boxId: 'BOX001',
      status: 'in-use',
      usageCount: 15,
      maxUsage: 20,
      createdAt: '2024-01-15',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Customer Premises'
    },
    'BOX002': {
      id: '2',
      boxId: 'BOX002',
      status: 'new',
      usageCount: 0,
      maxUsage: 20,
      createdAt: '2024-01-20',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Warehouse'
    }
  };

  const mockHistory: Record<string, BoxHistory[]> = {
    'BOX001': [
      {
        id: '1',
        boxId: 'BOX001',
        action: 'created',
        performedBy: 'System',
        timestamp: '2024-01-15T08:00:00Z',
        details: 'Box manufactured and registered'
      },
      {
        id: '2',
        boxId: 'BOX001',
        action: 'delivered',
        performedBy: 'John Delivery',
        timestamp: '2024-01-22T14:30:00Z',
        details: 'Delivered to customer - Usage count: 15'
      }
    ]
  };

  const handleScan = async (boxId: string) => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const box = mockBoxes[boxId];
    const history = mockHistory[boxId] || [];

    if (box) {
      setScannedBox(box);
      setBoxHistory(history);
    } else {
      toast({
        title: "Box Not Found",
        description: `Box ${boxId} was not found or doesn't belong to your company.`,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleFlagDamaged = () => {
    if (scannedBox) {
      toast({
        title: "Box Flagged",
        description: `Box ${scannedBox.boxId} has been flagged for inspection.`,
      });
    }
  };

  const handleRetireBox = () => {
    if (scannedBox) {
      toast({
        title: "Box Retired",
        description: `Box ${scannedBox.boxId} has been marked for retirement.`,
      });
    }
  };

  const getStatusInfo = (box: Box) => {
    const usagePercentage = (box.usageCount / box.maxUsage) * 100;
    
    if (box.status === 'retired') {
      return { color: 'bg-muted text-muted-foreground', message: 'Retired' };
    } else if (usagePercentage >= 90) {
      return { color: 'bg-destructive text-destructive-foreground', message: 'Retire Soon' };
    } else if (usagePercentage >= 70) {
      return { color: 'bg-warning text-warning-foreground', message: 'High Usage' };
    } else if (usagePercentage > 0) {
      return { color: 'bg-primary text-primary-foreground', message: 'Active' };
    } else {
      return { color: 'bg-success text-success-foreground', message: 'New' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Track Box</h1>
        <p className="text-muted-foreground">
          Monitor box usage and lifecycle information
        </p>
      </div>

      <RFIDScanner onScan={handleScan} title="Scan Box to Track" />

      {loading && (
        <Card className="animate-slide-up">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading box information...</span>
          </CardContent>
        </Card>
      )}

      {scannedBox && (
        <div className="space-y-6 animate-slide-up">
          {/* Box Overview */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Box {scannedBox.boxId}
                </CardTitle>
                <Badge className={getStatusInfo(scannedBox).color}>
                  {getStatusInfo(scannedBox).message}
                </Badge>
              </div>
              <CardDescription>
                Current Location: {scannedBox.currentLocation}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Usage Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Usage Count</span>
                  <span className="font-medium">
                    {scannedBox.usageCount} / {scannedBox.maxUsage}
                  </span>
                </div>
                <Progress 
                  value={(scannedBox.usageCount / scannedBox.maxUsage) * 100}
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {scannedBox.maxUsage - scannedBox.usageCount} uses remaining
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{new Date(scannedBox.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Manufacturer:</span>
                  <p className="font-medium">{scannedBox.manufacturer}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{scannedBox.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Usage Rate:</span>
                  <p className="font-medium">
                    {((scannedBox.usageCount / scannedBox.maxUsage) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              {scannedBox.status !== 'retired' && (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="warning"
                    size="sm"
                    onClick={handleFlagDamaged}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Flag as Damaged
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={handleRetireBox}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Retire Box
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Timeline */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Box History
              </CardTitle>
              <CardDescription>
                Complete lifecycle and usage history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {boxHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No history available for this box.
                </p>
              ) : (
                <div className="space-y-4">
                  {boxHistory.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        {index < boxHistory.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {event.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {event.performedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};