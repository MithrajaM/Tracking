import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      const { user: userData, accessToken } = response.data;

      // Store auth data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (role: UserRole) => {
    // Demo mode - create mock user without API call
    const demoUsers = {
      'end-user': {
        id: '1',
        name: 'Kumar',
        email: 'agent@tracktrack.com',
        role: 'end-user' as UserRole
      },
      'manufacturer': {
        id: '2',
        name: 'Gopi',
        email: 'manufacturer@tracktrack.com',
        role: 'manufacturer' as UserRole
      },
      'admin': {
        id: '3',
        name: 'Saravanan',
        email: 'admin@tracktrack.com',
        role: 'admin' as UserRole
      }
    };

    const user = demoUsers[role];

    // Store demo auth data
    localStorage.setItem('authToken', 'demo-token-' + role);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);

    toast({
      title: "Access Granted",
      description: `Welcome, ${user.name}! You're now in demo mode.`,
    });
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithCredentials,
      logout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};