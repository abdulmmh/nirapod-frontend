import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RoleService } from '../../service/role.service';

@Component({
  selector: 'app-roles-create',
  templateUrl: './roles-create.component.html',
  styleUrls: ['./roles-create.component.css'],
})
export class RolesCreateComponent implements OnDestroy {

  isLoading = false;
  private destroy$ = new Subject<void>();

  modules = [
    'Taxpayer Management', 'Business Registration', 'TIN Management',
    'VAT Registration', 'VAT Returns', 'Income Tax Returns', 'Payments',
    'Refund Management', 'Penalty & Fines', 'Audit Management',
    'Document Verification', 'Notices & Notifications', 'Tax Structure',
    'Taxable Products', 'Import Duty', 'AIT', 'Fiscal Years',
    'Reports & Analytics', 'User Management', 'Roles & Permissions',
    'Activity Logs', 'System Settings',
  ];

  form: any = {
    name:        '',
    code:        '',
    description: '',
    color:       '#1a3f8f',
    status:      'Active',
    permissions: {} as Record<string, {
      create: boolean; read: boolean; update: boolean;
      delete: boolean; export: boolean;
    }>,
  };

  constructor(
    private router:      Router,
    private toast:       ToastService,
    private roleService: RoleService,
  ) {
    this.modules.forEach((m) => {
      this.form.permissions[m] = {
        create: false, read: false, update: false,
        delete: false, export: false,
      };
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRoleNameChange(): void {
    this.form.code = this.form.name
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
    this.modules.forEach((m) => this.toggleAll(m, checked));
  }

  get selectedPermCount(): number {
    return this.modules.reduce((sum, m) => {
      const p = this.form.permissions[m];
      return sum + [p.create, p.read, p.update, p.delete, p.export].filter(Boolean).length;
    }, 0);
  }

  isFormValid(): boolean {
    return !!(this.form.name && this.form.code);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.error('Role name is required.');
      return;
    }

    this.isLoading = true;

    // Convert permissions object to array, then JSON stringify for backend
    const permissionsArray = this.modules.map((m) => ({
      module: m,
      ...this.form.permissions[m],
    }));

    const payload = {
      name:        this.form.name,
      code:        this.form.code,
      description: this.form.description,
      color:       this.form.color,
      status:      this.form.status,
      permissions: JSON.stringify(permissionsArray),
    };

    this.roleService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success(`Role "${this.form.name}" created successfully!`);
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || 'Failed to create role.';
          this.toast.error(message);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/roles']);
  }
}
