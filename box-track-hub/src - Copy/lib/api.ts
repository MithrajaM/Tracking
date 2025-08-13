import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (userData: { name?: string; email?: string }) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Box API
export const boxAPI = {
  createBox: async (boxData: {
    boxId: string;
    manufacturer: string;
    maxUsage?: number;
    currentLocation?: string;
    material?: string;
    notes?: string;
  }) => {
    const response = await api.post('/boxes', boxData);
    return response.data;
  },
  
  getBox: async (id: string) => {
    const response = await api.get(`/boxes/${id}`);
    return response.data;
  },
  
  getBoxes: async (params?: {
    status?: string;
    manufacturer?: string;
    location?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/boxes', { params });
    return response.data;
  },
  
  updateBoxStatus: async (
    id: string,
    data: {
      status?: string;
      reason?: string;
      incrementUsage?: boolean;
    }
  ) => {
    const response = await api.patch(`/boxes/${id}/status`, data);
    return response.data;
  },
  
  updateBox: async (id: string, boxData: any) => {
    const response = await api.put(`/boxes/${id}`, boxData);
    return response.data;
  },
  
  deleteBox: async (id: string) => {
    const response = await api.delete(`/boxes/${id}`);
    return response.data;
  },
};

// Delivery API
export const deliveryAPI = {
  createDelivery: async (deliveryData: FormData) => {
    const response = await api.post('/deliveries', deliveryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getDeliveries: async (params?: {
    boxId?: string;
    deliveredBy?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    city?: string;
    state?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },
  
  getDelivery: async (id: string) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },
  
  getBoxDeliveryHistory: async (boxId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/deliveries/box/${boxId}`, { params });
    return response.data;
  },
  
  updateDelivery: async (id: string, data: { deliveryStatus?: string; notes?: string }) => {
    const response = await api.patch(`/deliveries/${id}`, data);
    return response.data;
  },
};

// User API (Admin only)
export const userAPI = {
  getUsers: async (params?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id: string, userData: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  resetUserPassword: async (id: string, newPassword: string) => {
    const response = await api.patch(`/users/${id}/password`, { newPassword });
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getSystemStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
  
  getDeliveryAnalytics: async (params?: {
    period?: string;
    groupBy?: string;
  }) => {
    const response = await api.get('/stats/deliveries', { params });
    return response.data;
  },
  
  getBoxAnalytics: async () => {
    const response = await api.get('/stats/boxes');
    return response.data;
  },
  
  getActivityAnalytics: async (params?: { period?: string }) => {
    const response = await api.get('/stats/activity', { params });
    return response.data;
  },
};

export default api;
