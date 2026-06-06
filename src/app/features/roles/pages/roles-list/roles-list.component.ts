import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RoleService } from '../../service/role.service';
import { Role } from 'src/app/models/role.model';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css'],
})
export class RolesListComponent implements OnInit, OnDestroy {

  roles: Role[]  = [];
  isLoading      = true;
  selectedRole   = '';
  private destroy$ = new Subject<void>();

  constructor(
    private roleService: RoleService,
    private toast:       ToastService,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.roles     = data;
          this.isLoading = false;
          if (data.length > 0) {
            this.selectedRole = data[0].code;
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load roles.');
        },
      });
  }

  get selectedRoleConfig(): Role | null {
    return this.roles.find((r) => r.code === this.selectedRole) || null;
  }

  selectRole(code: string): void {
    this.selectedRole = code;
  }

  getRoleColorClass(color: string): string {
    // If it's a hex colour (from color picker), return empty and use inline style
    if (color && color.startsWith('#')) return '';
    return 'role-' + color;
  }

  getRoleColorStyle(color: string): string {
    if (color && color.startsWith('#')) {
      return `background: linear-gradient(135deg, ${color}, ${color}cc)`;
    }
    return '';
  }

  countPermissions(role: Role): number {
    if (!role.permissions) return 0;
    return role.permissions.reduce(
      (sum, p) =>
        sum + [p.create, p.read, p.update, p.delete, p.export].filter(Boolean).length,
      0,
    );
  }
}
