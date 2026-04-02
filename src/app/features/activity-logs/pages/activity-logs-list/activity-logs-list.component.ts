import { Component, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-activity-logs-list',
  templateUrl: './activity-logs-list.component.html',
  styleUrls: ['./activity-logs-list.component.css']
})
export class ActivityLogsListComponent implements OnInit {

  logs: ActivityLog[] = [];
  searchTerm  = '';
  filterType  = '';
  filterDate  = '';
  isLoading   = false;

  actionTypes = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VIEW'];

  private fallback: ActivityLog[] = [
    { id: 1,  action: 'User Login',           actionType: 'LOGIN',  module: 'Auth',               description: 'Successful login from Chrome browser',         performedBy: 'super_admin',  userRole: 'SUPER_ADMIN',       ipAddress: '192.168.1.101', timestamp: '2026-04-01 08:31:15', status: 'Success' },
    { id: 2,  action: 'Create Taxpayer',       actionType: 'CREATE', module: 'Taxpayer Mgmt',      description: 'New taxpayer registered: Abdul Karim (TIN-1001)', performedBy: 'tax_off_01',  userRole: 'TAX_OFFICER',       ipAddress: '192.168.1.102', timestamp: '2026-04-01 09:05:22', status: 'Success' },
    { id: 3,  action: 'Update VAT Return',     actionType: 'UPDATE', module: 'VAT Returns',        description: 'VAT Return VRT-2024-00003 status updated to Accepted', performedBy: 'tax_comm_01', userRole: 'TAX_COMMISSIONER',  ipAddress: '192.168.1.103', timestamp: '2026-04-01 09:30:44', status: 'Success' },
    { id: 4,  action: 'Export Report',         actionType: 'EXPORT', module: 'Reports',            description: 'VAT Collection Report exported for FY 2024-25',  performedBy: 'tax_comm_01', userRole: 'TAX_COMMISSIONER',  ipAddress: '192.168.1.103', timestamp: '2026-04-01 10:00:00', status: 'Success' },
    { id: 5,  action: 'Delete Penalty',        actionType: 'DELETE', module: 'Penalty & Fines',    description: 'Penalty PEN-2024-00012 deleted',                 performedBy: 'super_admin',  userRole: 'SUPER_ADMIN',       ipAddress: '192.168.1.101', timestamp: '2026-04-01 10:15:33', status: 'Success' },
    { id: 6,  action: 'Failed Login Attempt',  actionType: 'LOGIN',  module: 'Auth',               description: 'Failed login: wrong password for auditor_02',   performedBy: 'auditor_02',  userRole: 'AUDITOR',           ipAddress: '192.168.1.105', timestamp: '2026-04-01 10:45:12', status: 'Failed'  },
    { id: 7,  action: 'View Audit Record',     actionType: 'VIEW',   module: 'Audit Management',   description: 'Audit AUD-2024-00005 viewed',                   performedBy: 'auditor_01',  userRole: 'AUDITOR',           ipAddress: '192.168.1.104', timestamp: '2026-04-01 11:00:55', status: 'Success' },
    { id: 8,  action: 'Create Import Duty',    actionType: 'CREATE', module: 'Import Duty',        description: 'New import duty record IMP-2024-00005 created', performedBy: 'tax_off_01',  userRole: 'TAX_OFFICER',       ipAddress: '192.168.1.102', timestamp: '2026-04-01 11:30:08', status: 'Success' },
    { id: 9,  action: 'Update User Status',    actionType: 'UPDATE', module: 'User Management',    description: 'User auditor_02 status changed to Suspended',    performedBy: 'super_admin',  userRole: 'SUPER_ADMIN',       ipAddress: '192.168.1.101', timestamp: '2026-04-01 12:00:20', status: 'Warning' },
    { id: 10, action: 'User Logout',           actionType: 'LOGOUT', module: 'Auth',               description: 'User logged out normally',                      performedBy: 'tax_comm_01', userRole: 'TAX_COMMISSIONER',  ipAddress: '192.168.1.103', timestamp: '2026-04-01 13:00:00', status: 'Success' },
    { id: 11, action: 'Create AIT Record',     actionType: 'CREATE', module: 'AIT',                description: 'New AIT deduction AIT-2024-00006 created',      performedBy: 'data_01',     userRole: 'DATA_ENTRY_OPERATOR', ipAddress: '192.168.1.106', timestamp: '2026-04-01 14:15:42', status: 'Success' },
    { id: 12, action: 'Update Tax Structure',  actionType: 'UPDATE', module: 'Tax Structure',      description: 'Standard VAT rate updated from 14% to 15%',     performedBy: 'super_admin',  userRole: 'SUPER_ADMIN',       ipAddress: '192.168.1.101', timestamp: '2026-04-01 15:00:11', status: 'Success' },
  ];

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.logs = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): ActivityLog[] {
    return this.logs.filter(log => {
      const matchSearch = !this.searchTerm ||
        log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchType = !this.filterType || log.actionType === this.filterType;

      return matchSearch && matchType;
    });
  }

  getActionClass(a: string): string {
    const map: Record<string, string> = {
      'CREATE': 'act-create', 'UPDATE': 'act-update', 'DELETE': 'act-delete',
      'LOGIN': 'act-login', 'LOGOUT': 'act-logout', 'EXPORT': 'act-export', 'VIEW': 'act-view'
    };
    return map[a] ?? '';
  }

  getActionIcon(a: string): string {
    const map: Record<string, string> = {
      'CREATE': 'bi bi-plus-circle-fill', 'UPDATE': 'bi bi-pencil-fill',
      'DELETE': 'bi bi-trash-fill', 'LOGIN': 'bi bi-box-arrow-in-right',
      'LOGOUT': 'bi bi-box-arrow-right', 'EXPORT': 'bi bi-download', 'VIEW': 'bi bi-eye-fill'
    };
    return map[a] ?? 'bi bi-circle-fill';
  }

  getStatusClass(s: string): string {
    return s === 'Success' ? 'status-active' : s === 'Warning' ? 'status-pending' : 'status-suspended';
  }

  // component e add koro
  countByStatus(status: string): number {
    return this.logs.filter(l => l.status === status).length;
  }
}