import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppUser } from '../user-list/user-list.component';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css']
})
export class UserViewComponent implements OnInit {

  user: AppUser | null = null;
  isLoading = true;

  private fallback: AppUser[] = [
    { id: 1, fullName: 'System Administrator', username: 'super_admin',  email: 'admin@nbr.gov.bd',   role: 'SUPER_ADMIN',      department: 'IT Administration', lastLogin: '2026-04-01 08:31', status: 'Active', createdAt: '2024-01-01' },
    { id: 2, fullName: 'Mohammad Rahman',       username: 'tax_comm_01', email: 'mrahman@nbr.gov.bd', role: 'TAX_COMMISSIONER', department: 'Tax Commission',    lastLogin: '2026-04-01 09:15', status: 'Active', createdAt: '2024-01-01' },
    { id: 3, fullName: 'Nusrat Jahan',          username: 'tax_off_01',  email: 'njahan@nbr.gov.bd',  role: 'TAX_OFFICER',      department: 'VAT Division',      lastLogin: '2026-03-31 14:22', status: 'Active', createdAt: '2024-01-15' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.user = this.fallback.find(u => u.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Suspended' ? 'status-suspended' : 'status-inactive';
  }

  getRoleLabel(r: string): string {
    const map: Record<string, string> = {
      'SUPER_ADMIN': 'Super Administrator', 'TAX_COMMISSIONER': 'Tax Commissioner',
      'TAX_OFFICER': 'Tax Officer', 'AUDITOR': 'Auditor',
      'DATA_ENTRY_OPERATOR': 'Data Entry Operator', 'TAXPAYER': 'Taxpayer'
    };
    return map[r] ?? r;
  }

  getRoleClass(r: string): string {
    const map: Record<string, string> = {
      'SUPER_ADMIN': 'role-super', 'TAX_COMMISSIONER': 'role-commissioner',
      'TAX_OFFICER': 'role-officer', 'AUDITOR': 'role-auditor',
      'DATA_ENTRY_OPERATOR': 'role-data', 'TAXPAYER': 'role-taxpayer'
    };
    return map[r] ?? '';
  }

  onEdit(): void { this.router.navigate(['/users/edit', this.user?.id]); }
  onBack(): void { this.router.navigate(['/users']); }
}