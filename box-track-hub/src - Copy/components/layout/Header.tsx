import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, UserCircle, LogOut } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'end-user':
        return 'Delivery Agent';
      case 'manufacturer':
        return 'Manufacturer';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">BoxTracker</h1>
            <p className="text-xs text-muted-foreground">RFID Box Management</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getRoleDisplayName(user.role)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};