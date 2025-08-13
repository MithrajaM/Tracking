import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Search, Filter, Plus, BarChart3, Download } from 'lucide-react';
import { Box } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const BoxesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [boxes, setBoxes] = useState<Box[]>([]);

  // Initialize boxes with mock data
  const mockBoxes: Box[] = [
    {
      id: '1',
      boxId: 'BOX001',
      status: 'in-use',
      usageCount: 15,
      maxUsage: 20,
      createdAt: '2024-01-15',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Customer Site A'
    },
    {
      id: '2',
      boxId: 'BOX002',
      status: 'new',
      usageCount: 0,
      maxUsage: 20,
      createdAt: '2024-01-20',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Warehouse'
    },
    {
      id: '3',
      boxId: 'BOX003',
      status: 'retired',
      usageCount: 20,
      maxUsage: 20,
      createdAt: '2024-01-10',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Recycling Center'
    },
    {
      id: '4',
      boxId: 'BOX004',
      status: 'in-use',
      usageCount: 8,
      maxUsage: 20,
      createdAt: '2024-01-18',
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Customer Site B'
    }
  ];

  // Initialize boxes state with mock data
  useEffect(() => {
    setBoxes(mockBoxes);
  }, []);

  // Generate new box ID
  const generateBoxId = () => {
    const existingIds = boxes.map(box => parseInt(box.boxId.replace('BOX', '')));
    const maxId = Math.max(...existingIds, 0);
    return `BOX${String(maxId + 1).padStart(3, '0')}`;
  };

  // Add new box function
  const handleAddNewBox = () => {
    const newBox: Box = {
      id: String(boxes.length + 1),
      boxId: generateBoxId(),
      status: 'new',
      usageCount: 0,
      maxUsage: 20,
      createdAt: new Date().toISOString().split('T')[0],
      manufacturer: 'EcoBox Ltd.',
      currentLocation: 'Warehouse'
    };

    setBoxes(prevBoxes => [...prevBoxes, newBox]);

    toast({
      title: "Box Created Successfully",
      description: `New box ${newBox.boxId} has been added to your inventory.`,
    });
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.boxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.currentLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || box.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-success text-success-foreground';
      case 'in-use': return 'bg-primary text-primary-foreground';
      case 'retired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUsageWarningLevel = (usageCount: number, maxUsage: number) => {
    const percentage = (usageCount / maxUsage) * 100;
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  const exportToCSV = () => {
    const headers = ['Box ID', 'Status', 'Usage Count', 'Max Usage', 'Manufacturer', 'Location', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredBoxes.map(box =>
        [
          box.boxId,
          box.status,
          box.usageCount,
          box.maxUsage,
          `"${box.manufacturer}"`,
          `"${box.currentLocation}"`,
          box.createdAt
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `boxes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Successfully exported ${filteredBoxes.length} box records to CSV.`,
    });
  };

  const stats = {
    total: boxes.length,
    new: boxes.filter(b => b.status === 'new').length,
    inUse: boxes.filter(b => b.status === 'in-use').length,
    retired: boxes.filter(b => b.status === 'retired').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            My Boxes
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your box inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add New Box
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Boxes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inUse}</p>
                <p className="text-sm text-muted-foreground">In Use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-destructive rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.retired}</p>
                <p className="text-sm text-muted-foreground">Retired</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-success rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search boxes..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'in-use', 'retired'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Box List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBoxes.map((box) => {
          const usagePercentage = (box.usageCount / box.maxUsage) * 100;
          const warningLevel = getUsageWarningLevel(box.usageCount, box.maxUsage);
          
          return (
            <Card key={box.id} className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{box.boxId}</CardTitle>
                  <Badge className={getStatusColor(box.status)}>
                    {box.status}
                  </Badge>
                </div>
                <CardDescription>
                  {box.currentLocation}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Usage</span>
                    <span className="font-medium">
                      {box.usageCount}/{box.maxUsage}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  {warningLevel === 'high' && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ Retire soon
                    </p>
                  )}
                  {warningLevel === 'medium' && (
                    <p className="text-xs text-warning mt-1">
                      ⚡ High usage
                    </p>
                  )}
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(box.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usage Rate:</span>
                    <span>{usagePercentage.toFixed(1)}%</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBoxes.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No boxes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first box.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Box
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};