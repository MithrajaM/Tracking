import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package, Camera, MapPin, FileText, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { SuccessDialog } from '@/components/ui/success-dialog';

interface DeliveryForm {
  photo: FileList | null;
  notes: string;
  location: string;
}

export const DeliveryPage = () => {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { register, handleSubmit, watch } = useForm<DeliveryForm>();

  // Mock box data
  const mockBox = {
    id: '1',
    boxId: boxId || 'BOX001',
    status: 'in-use',
    usageCount: 5,
    maxUsage: 20,
    manufacturer: 'EcoBox Ltd.',
    currentLocation: 'In Transit'
  };

  const photoFiles = watch('photo');

  // Handle photo preview
  useState(() => {
    if (photoFiles && photoFiles.length > 0) {
      const file = photoFiles[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  });

  const onSubmit = async (data: DeliveryForm) => {
    setIsSubmitting(true);

    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowSuccessDialog(true);
  };

  const capturePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Manually trigger the form update
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
        photoInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mark Delivery</h1>
        <p className="text-muted-foreground">
          Complete the delivery for Box {boxId}
        </p>
      </div>

      {/* Box Information */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Box {mockBox.boxId}
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              {mockBox.status}
            </Badge>
          </div>
          <CardDescription>
            Manufactured by {mockBox.manufacturer}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Usage:</span>
              <p className="font-medium">{mockBox.usageCount} / {mockBox.maxUsage}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium">{mockBox.currentLocation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
          <CardDescription>
            Please provide delivery confirmation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Delivery Photo *
              </label>
              
              <input
                id="photo"
                type="file"
                accept="image/*"
                {...register('photo', { required: true })}
                className="hidden"
              />
              
              {!previewUrl ? (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    variant="outline"
                    size="lg"
                    className="w-full h-32 border-dashed"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <span>Take Photo</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => document.getElementById('photo')?.click()}
                    variant="ghost"
                    size="sm"
                  >
                    Or choose from gallery
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Delivery preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      const photoInput = document.getElementById('photo') as HTMLInputElement;
                      photoInput.value = '';
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Take New Photo
                  </Button>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Location
              </label>
              <Input
                {...register('location')}
                placeholder="e.g., Front door, Reception desk..."
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Delivery Notes (Optional)
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes about the delivery..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || !previewUrl}
              variant="success"
              size="lg"
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Confirming Delivery...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Delivery
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Delivery Confirmed!"
        description={`Box ${boxId} has been successfully marked as delivered. Thank you for completing this delivery.`}
        actionLabel="Scan Next Box"
        onAction={() => {
          setShowSuccessDialog(false);
          navigate('/scan');
        }}
      />
    </div>
  );
};