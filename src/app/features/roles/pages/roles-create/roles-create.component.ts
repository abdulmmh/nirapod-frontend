import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-create',
  templateUrl: './roles-create.component.html',
  styleUrls: ['./roles-create.component.css']
})
export class RolesCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  modules = [
    'Taxpayer Management', 'Business Registration', 'TIN Management',
    'VAT Registration', 'VAT Returns', 'Income Tax Returns',
    'Payments', 'Refund Management', 'Penalty & Fines',
    'Audit Management', 'Document Verification', 'Notices & Notifications',
    'Tax Structure', 'Taxable Products', 'Import Duty', 'AIT', 'Fiscal Years',
    'Reports & Analytics', 'User Management', 'Roles & Permissions',
    'Activity Logs', 'System Settings'
  ];

  form: any = {
    roleName:    '',
    roleCode:    '',
    description: '',
    color:       '#1a3f8f',
    status:      'Active',
    permissions: {} as Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean; export: boolean; }>
  };

  constructor(private router: Router) {
    this.modules.forEach(m => {
      this.form.permissions[m] = {
        create: false, read: false,
        update: false, delete: false, export: false
      };
    });
  }

  onRoleNameChange(): void {
    this.form.roleCode = this.form.roleName
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z_]/g, '');
  }

  toggleAll(module: string, checked: boolean): void {
    const p = this.form.permissions[module];
    p.create = p.read = p.update = p.delete = p.export = checked;
  }

  isAllSelected(module: string): boolean {
    const p = this.form.permissions[module];
    return p.create && p.read && p.update && p.delete && p.export;
  }

  isSomeSelected(module: string): boolean {
    const p = this.form.permissions[module];
    const vals = [p.create, p.read, p.update, p.delete, p.export];
    return vals.some(Boolean) && !vals.every(Boolean);
  }

  selectAllModules(checked: boolean): void {
    this.modules.forEach(m => this.toggleAll(m, checked));
  }

  get selectedPermCount(): number {
    return this.modules.reduce((sum, m) => {
      const p = this.form.permissions[m];
      return sum + [p.create, p.read, p.update, p.delete, p.export].filter(Boolean).length;
    }, 0);
  }

  isFormValid(): boolean {
    return !!(this.form.roleName && this.form.roleCode);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Role name is required.'; return; }
    this.isLoading = true; this.errorMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = `Role "${this.form.roleName}" created successfully!`;
      setTimeout(() => this.router.navigate(['/roles']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/roles']); }
}