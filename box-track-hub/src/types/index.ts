export type UserRole = 'end-user' | 'manufacturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Box {
  id: string;
  boxId: string;
  status: 'new' | 'in-use' | 'damaged' | 'retired';
  usageCount: number;
  maxUsage: number;
  createdAt: string;
  manufacturer?: string;
  currentLocation?: string;
}

export interface Delivery {
  id: string;
  boxId: string;
  deliveredBy: string;
  deliveredAt: string;
  photo?: string;
  notes?: string;
  location?: string;
}

export interface BoxHistory {
  id: string;
  boxId: string;
  action: 'created' | 'delivered' | 'flagged' | 'retired';
  performedBy: string;
  timestamp: string;
  details?: string;
}