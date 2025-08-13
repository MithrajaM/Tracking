import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Filter, Truck, Package, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Delivery {
  id: string;
  boxId: string;
  agentName: string;
  customerName: string;
  deliveryDate: string;
  status: 'completed' | 'pending' | 'failed';
  location: string;
  notes?: string;
  photo?: string;
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    boxId: 'BOX001',
    agentName: 'Kumar',
    customerName: 'Ramesh Kumar',
    deliveryDate: '2024-01-20 14:30',
    status: 'completed',
    location: 'Front door',
    notes: 'Package delivered safely'
  },
  {
    id: '2',
    boxId: 'BOX002',
    agentName: 'Gopi',
    customerName: 'Suresh Gopi',
    deliveryDate: '2024-01-20 16:45',
    status: 'completed',
    location: 'Reception desk',
    notes: 'Signed by receptionist'
  },
  {
    id: '3',
    boxId: 'BOX003',
    agentName: 'Saravanan',
    customerName: 'Ramesh Saravanan',
    deliveryDate: '2024-01-21 09:15',
    status: 'pending',
    location: 'Office building',
    notes: 'Awaiting customer confirmation'
  },
  {
    id: '4',
    boxId: 'BOX004',
    agentName: 'Ramesh',
    customerName: 'Suresh Kumar',
    deliveryDate: '2024-01-21 11:20',
    status: 'failed',
    location: 'Home address',
    notes: 'Customer not available'
  },
  {
    id: '5',
    boxId: 'BOX005',
    agentName: 'Suresh',
    customerName: 'Gopi Kumar',
    deliveryDate: '2024-01-21 15:30',
    status: 'completed',
    location: 'Side entrance',
    notes: 'Left with neighbor'
  }
];

export const DeliveriesPage = () => {
  const { toast } = useToast();
  const [deliveries] = useState<Delivery[]>(mockDeliveries);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Apply filters when search term or filters change
  useEffect(() => {
    let filtered = deliveries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(delivery =>
        delivery.boxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(delivery => {
        const deliveryDate = new Date(delivery.deliveryDate);
        return deliveryDate >= filterDate;
      });
    }

    setFilteredDeliveries(filtered);
  }, [searchTerm, statusFilter, dateFilter, deliveries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const exportToCSV = () => {
    const headers = ['Box ID', 'Agent', 'Customer', 'Date', 'Status', 'Location', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredDeliveries.map(delivery =>
        [
          delivery.boxId,
          delivery.agentName,
          delivery.customerName,
          delivery.deliveryDate,
          delivery.status,
          `"${delivery.location}"`,
          `"${delivery.notes || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `deliveries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Successfully exported ${filteredDeliveries.length} delivery records to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            All Deliveries
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all delivery records
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{deliveries.length}</p>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                <Package className="h-4 w-4 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {deliveries.filter(d => d.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                <Package className="h-4 w-4 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {deliveries.filter(d => d.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                <Package className="h-4 w-4 text-destructive-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {deliveries.filter(d => d.status === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Filter deliveries by status, date, or search by box ID, agent, customer, or location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by box ID, agent, customer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Records ({filteredDeliveries.length})</CardTitle>
          <CardDescription>
            Detailed view of all delivery activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Box ID</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.boxId}</TableCell>
                    <TableCell>{delivery.agentName}</TableCell>
                    <TableCell>{delivery.customerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(delivery.deliveryDate).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{delivery.location}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-sm text-muted-foreground truncate block">
                        {delivery.notes || 'No notes'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No deliveries found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};