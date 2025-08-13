import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const DashboardPage = () => {
  // Mock data for dashboard
  const stats = {
    totalBoxes: 847,
    todayDeliveries: 23,
    activeUsers: 156,
    boxesInTransit: 89
  };

  const recentDeliveries = [
    { id: '1', boxId: 'BOX234', agent: 'Kumar', time: '2 min ago', location: 'Downtown' },
    { id: '2', boxId: 'BOX891', agent: 'Gopi', time: '8 min ago', location: 'Uptown' },
    { id: '3', boxId: 'BOX445', agent: 'Saravanan', time: '12 min ago', location: 'Suburbs' },
    { id: '4', boxId: 'BOX123', agent: 'Ramesh', time: '18 min ago', location: 'Industrial' }
  ];

  const alertBoxes = [
    { boxId: 'BOX567', issue: 'High usage (19/20)', severity: 'warning' },
    { boxId: 'BOX890', issue: 'Max usage reached', severity: 'error' },
    { boxId: 'BOX234', issue: 'Flagged as damaged', severity: 'error' }
  ];

  const usageByManufacturer = [
    { name: 'EcoBox Ltd.', boxes: 340, percentage: 78 },
    { name: 'GreenPack Co.', boxes: 280, percentage: 65 },
    { name: 'BoxCorp Inc.', boxes: 227, percentage: 91 }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and key metrics
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalBoxes}</p>
                <p className="text-sm text-muted-foreground">Total Boxes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.todayDeliveries}</p>
                <p className="text-sm text-muted-foreground">Today's Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.boxesInTransit}</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Deliveries
            </CardTitle>
            <CardDescription>
              Latest delivery confirmations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">{delivery.boxId}</p>
                      <p className="text-sm text-muted-foreground">by {delivery.agent}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{delivery.time}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {delivery.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Boxes requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertBoxes.map((alert, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'error' ? 'bg-destructive' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{alert.boxId}</p>
                    <p className="text-sm text-muted-foreground">{alert.issue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturer Usage */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage by Manufacturer
          </CardTitle>
          <CardDescription>
            Box utilization rates across manufacturers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {usageByManufacturer.map((manufacturer) => (
              <div key={manufacturer.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{manufacturer.name}</span>
                  <div className="text-right">
                    <span className="text-foreground">{manufacturer.boxes} boxes</span>
                    <span className="text-muted-foreground ml-2">({manufacturer.percentage}% utilized)</span>
                  </div>
                </div>
                <Progress value={manufacturer.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart Placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Activity
          </CardTitle>
          <CardDescription>
            Delivery volume over the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-dashboard rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Chart visualization would go here
              </p>
              <p className="text-sm text-muted-foreground">
                Integration with charting library like Recharts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};