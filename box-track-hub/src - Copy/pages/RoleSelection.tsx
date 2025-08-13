import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Package, User, Shield } from 'lucide-react';
import { UserRole } from '@/types';
import heroImage from '@/assets/hero-logistics.jpg';

export const RoleSelection = () => {
  const { login } = useAuth();

  const roles = [
    {
      role: 'end-user' as UserRole,
      title: 'Delivery Agent',
      description: 'Scan boxes and mark deliveries',
      icon: User,
      features: ['RFID Tag scanning', 'Delivery confirmation', 'Photo upload']
    },
    {
      role: 'manufacturer' as UserRole,
      title: 'Manufacturer',
      description: 'Track box usage and lifecycle',
      icon: Package,
      features: ['Box tracking', 'Usage analytics', 'Lifecycle management']
    },
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Full system management access',
      icon: Shield,
      features: ['System dashboard', 'User management', 'Analytics & reports']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <img 
              src={heroImage} 
              alt="Logistics and RFID scanning"
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-card"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Package className="h-16 w-16" />
                  <h1 className="text-5xl md:text-6xl font-bold">BoxTracker</h1>
                </div>
                <p className="text-xl md:text-2xl opacity-90">
                  RFID-Based Box Tracking System
                </p>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Professional logistics management platform
          </p>
          <p className="text-sm text-muted-foreground">
            Select your role to access the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((roleData) => {
            const Icon = roleData.icon;
            return (
              <Card 
                key={roleData.role} 
                className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{roleData.title}</CardTitle>
                  <CardDescription>{roleData.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {roleData.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => login(roleData.role)}
                    className="w-full"
                    size="lg"
                  >
                    Continue as {roleData.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">
            Demo system - Choose any role to explore the interface
          </p>
          <p className="text-xs text-muted-foreground">
            Try scanning RFID tags: BOX001, BOX002, BOX003, BOX004, or BOX005
          </p>
        </div>
      </div>
    </div>
  );
};