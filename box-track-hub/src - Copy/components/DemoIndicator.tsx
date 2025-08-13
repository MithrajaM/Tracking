import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export const DemoIndicator = () => {
  const token = localStorage.getItem('authToken');
  const isDemoMode = !token || token.startsWith('demo-token-');

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
        <Info className="h-3 w-3 mr-1" />
        Demo Mode
      </Badge>
    </div>
  );
};
