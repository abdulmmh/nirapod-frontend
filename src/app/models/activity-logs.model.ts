export interface ActivityLog {
  id: number;
  action: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'VIEW';
  module: string;
  description: string;
  performedBy: string;
  userRole: string;
  ipAddress: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
}