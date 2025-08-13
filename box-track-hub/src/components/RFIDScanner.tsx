import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, Type, X } from 'lucide-react';

interface RFIDScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
  title?: string;
}

export const RFIDScanner = ({ onScan, onClose, title = "Scan RFID Tag" }: RFIDScannerProps) => {
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  // Simulate RFID detection for demo
  const simulateRFIDScan = () => {
    const demoBoxIds = ['BOX001', 'BOX002', 'BOX003', 'BOX404'];
    const randomBox = demoBoxIds[Math.floor(Math.random() * demoBoxIds.length)];
    onScan(randomBox);
    stopCamera();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setScanMode('camera')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={scanMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setScanMode('manual');
              stopCamera();
            }}
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-2" />
            Manual
          </Button>
        </div>

        {scanMode === 'camera' && (
          <div className="space-y-4">
            {!isScanning && (
              <Button 
                onClick={startCamera}
                variant="scan"
                className="w-full"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </Button>
            )}
            
            {isScanning && (
              <div className="space-y-4">
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-48 object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg m-4 animate-scan-pulse" />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={simulateRFIDScan}
                    variant="success"
                    className="flex-1"
                  >
                    Demo Scan
                  </Button>
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    Stop
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {scanMode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Enter Box ID
              </label>
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g., BOX001"
                className="text-center text-lg font-mono"
              />
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full"
              size="lg"
            >
              Submit Box ID
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
