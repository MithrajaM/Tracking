import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Package, 
  BarChart3, 
  Users, 
  Truck,
  CheckCircle 
} from 'lucide-react';

export const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const getNavItems = () => {
    switch (user.role) {
      case 'end-user':
        return [
          { path: '/scan', icon: QrCode, label: 'Scan Box', description: 'Scan RFID tags' },
          { path: '/deliveries', icon: CheckCircle, label: 'My Deliveries', description: 'View history' }
        ];
      case 'manufacturer':
        return [
          { path: '/track', icon: Package, label: 'Track Box', description: 'Box usage info' },
          { path: '/boxes', icon: Package, label: 'My Boxes', description: 'Manage boxes' }
        ];
      case 'admin':
        return [
          { path: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Analytics' },
          { path: '/boxes', icon: Package, label: 'All Boxes', description: 'Box management' },
          { path: '/admin/deliveries', icon: Truck, label: 'All Deliveries', description: 'Track deliveries' },
          { path: '/users', icon: Users, label: 'Users', description: 'User management' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                asChild
                variant={active ? 'default' : 'ghost'}
                size="sm"
                className="flex-col h-auto py-3 px-4 min-w-0 flex-1"
              >
                <Link to={item.path}>
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {item.description}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};