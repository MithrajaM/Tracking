import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Mail
} from 'lucide-react';
import { User, UserRole } from '@/types';

export const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Mock user data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Kumar',
      email: 'kumar@delivery.com',
      role: 'end-user'
    },
    {
      id: '2',
      name: 'Gopi',
      email: 'gopi@ecobox.com',
      role: 'manufacturer'
    },
    {
      id: '3',
      name: 'Saravanan',
      email: 'saravanan@company.com',
      role: 'admin'
    },
    {
      id: '4',
      name: 'Ramesh',
      email: 'ramesh@delivery.com',
      role: 'end-user'
    },
    {
      id: '5',
      name: 'Suresh',
      email: 'suresh@greenpack.com',
      role: 'manufacturer'
    },
    {
      id: '6',
      name: 'Kumar',
      email: 'kumar2@delivery.com',
      role: 'end-user'
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'manufacturer': return 'bg-primary text-primary-foreground';
      case 'end-user': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'end-user': return 'Delivery Agent';
      case 'manufacturer': return 'Manufacturer';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  const stats = {
    total: mockUsers.length,
    admins: mockUsers.filter(u => u.role === 'admin').length,
    manufacturers: mockUsers.filter(u => u.role === 'manufacturer').length,
    endUsers: mockUsers.filter(u => u.role === 'end-user').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.endUsers}</p>
                <p className="text-sm text-muted-foreground">Agents</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.manufacturers}</p>
                <p className="text-sm text-muted-foreground">Manufacturers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
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
                placeholder="Search users by name or email..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'admin', 'manufacturer', 'end-user'].map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role === 'all' ? 'All Roles' : getRoleDisplayName(role as UserRole)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            System user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No users have been added to the system yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};