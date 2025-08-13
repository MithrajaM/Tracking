import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Calendar, MapPin, Search, Image } from 'lucide-react';
import { Delivery } from '@/types';

export const DeliveriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock delivery data
  const mockDeliveries: Delivery[] = [
    {
      id: '1',
      boxId: 'BOX001',
      deliveredBy: 'Kumar',
      deliveredAt: '2024-01-22T14:30:00Z',
      photo: '/api/placeholder/300/200',
      notes: 'Left at front door as requested',
      location: 'Front door'
    },
    {
      id: '2',
      boxId: 'BOX005',
      deliveredBy: 'Gopi',
      deliveredAt: '2024-01-22T10:15:00Z',
      location: 'Reception desk'
    },
    {
      id: '3',
      boxId: 'BOX003',
      deliveredBy: 'Saravanan',
      deliveredAt: '2024-01-21T16:45:00Z',
      photo: '/api/placeholder/300/200',
      notes: 'Customer was present during delivery',
      location: 'Customer hands'
    },
    {
      id: '4',
      boxId: 'BOX007',
      deliveredBy: 'Ramesh',
      deliveredAt: '2024-01-21T09:20:00Z',
      location: 'Side entrance'
    }
  ];

  const filteredDeliveries = mockDeliveries.filter(delivery =>
    delivery.boxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (delivery: Delivery) => {
    const now = new Date();
    const deliveredAt = new Date(delivery.deliveredAt);
    const hoursAgo = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 24) {
      return <Badge className="bg-success text-success-foreground">Recent</Badge>;
    } else if (hoursAgo < 72) {
      return <Badge className="bg-primary text-primary-foreground">This Week</Badge>;
    }
    return <Badge variant="outline">Completed</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Deliveries</h1>
        <p className="text-muted-foreground">
          View your delivery history and confirmation details
        </p>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Box ID or location..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{mockDeliveries.length}</p>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockDeliveries.filter(d => {
                    const deliveredAt = new Date(d.deliveredAt);
                    const today = new Date();
                    return deliveredAt.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Image className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockDeliveries.filter(d => d.photo).length}
                </p>
                <p className="text-sm text-muted-foreground">With Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No deliveries found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t made any deliveries yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map((delivery) => {
            const { date, time } = formatDate(delivery.deliveredAt);
            
            return (
              <Card key={delivery.id} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Box {delivery.boxId}
                    </CardTitle>
                    {getStatusBadge(delivery)}
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {date} at {time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {delivery.location}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {delivery.photo && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Delivery Photo:</p>
                      <img
                        src={delivery.photo}
                        alt="Delivery confirmation"
                        className="w-full max-w-sm h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {delivery.notes && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{delivery.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};