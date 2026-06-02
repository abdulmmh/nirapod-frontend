export interface User {
  id: number;
  fullName: string;
  username?: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: string;
  createdAt?: string;
  emailVerified?: boolean;
}
