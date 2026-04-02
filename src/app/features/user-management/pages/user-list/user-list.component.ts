import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface AppUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users: AppUser[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: AppUser[] = [
    { id: 1, fullName: 'System Administrator', username: 'super_admin',  email: 'admin@nbr.gov.bd',     role: 'SUPER_ADMIN',       department: 'IT Administration',  lastLogin: '2026-04-01 08:31', status: 'Active',    createdAt: '2024-01-01' },
    { id: 2, fullName: 'Mohammad Rahman',       username: 'tax_comm_01', email: 'mrahman@nbr.gov.bd',   role: 'TAX_COMMISSIONER',  department: 'Tax Commission',     lastLogin: '2026-04-01 09:15', status: 'Active',    createdAt: '2024-01-01' },
    { id: 3, fullName: 'Nusrat Jahan',          username: 'tax_off_01',  email: 'njahan@nbr.gov.bd',    role: 'TAX_OFFICER',       department: 'VAT Division',       lastLogin: '2026-03-31 14:22', status: 'Active',    createdAt: '2024-01-15' },
    { id: 4, fullName: 'Kamal Hossain',         username: 'auditor_01',  email: 'khossain@nbr.gov.bd',  role: 'AUDITOR',           department: 'Audit Division',     lastLogin: '2026-03-30 10:45', status: 'Active',    createdAt: '2024-02-01' },
    { id: 5, fullName: 'Fatema Begum',          username: 'data_01',     email: 'fbegum@nbr.gov.bd',    role: 'DATA_ENTRY_OPERATOR', department: 'Data Management', lastLogin: '2026-03-28 16:30', status: 'Active',    createdAt: '2024-02-15' },
    { id: 6, fullName: 'Abdul Karim',           username: 'taxpayer_01', email: 'akarim@example.com',   role: 'TAXPAYER',          department: 'External',           lastLogin: '2026-03-25 11:00', status: 'Active',    createdAt: '2024-03-01' },
    { id: 7, fullName: 'Rahim Uddin',           username: 'tax_off_02',  email: 'ruddin@nbr.gov.bd',    role: 'TAX_OFFICER',       department: 'Income Tax Division', lastLogin: '2026-02-15 09:00', status: 'Inactive',  createdAt: '2024-03-15' },
    { id: 8, fullName: 'Samira Islam',          username: 'auditor_02',  email: 'sislam@nbr.gov.bd',    role: 'AUDITOR',           department: 'Audit Division',     lastLogin: '2026-01-10 14:00', status: 'Suspended', createdAt: '2024-04-01' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.users = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): AppUser[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u =>
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)    ||
      u.role.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Suspended' ? 'status-suspended' : 'status-inactive';
  }

  getRoleClass(r: string): string {
    const map: Record<string, string> = {
      'SUPER_ADMIN': 'role-super', 'TAX_COMMISSIONER': 'role-commissioner',
      'TAX_OFFICER': 'role-officer', 'AUDITOR': 'role-auditor',
      'DATA_ENTRY_OPERATOR': 'role-data', 'TAXPAYER': 'role-taxpayer'
    };
    return map[r] ?? '';
  }

  getRoleLabel(r: string): string {
    const map: Record<string, string> = {
      'SUPER_ADMIN': 'Super Admin', 'TAX_COMMISSIONER': 'Commissioner',
      'TAX_OFFICER': 'Tax Officer', 'AUDITOR': 'Auditor',
      'DATA_ENTRY_OPERATOR': 'Data Entry', 'TAXPAYER': 'Taxpayer'
    };
    return map[r] ?? r;
  }

  view(id: number): void { this.router.navigate(['/users/view', id]); }
  edit(id: number): void { this.router.navigate(['/users/edit', id]); }

  delete(id: number): void {
    if (!confirm('Delete this user?')) return;
    this.users = this.users.filter(u => u.id !== id);
  }
}