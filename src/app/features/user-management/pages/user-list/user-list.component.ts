import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  searchTerm = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load users:', err);
          this.toast.error('Failed to load users');
          this.isLoading = false;
        }
      });
  }

  get filtered(): User[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        (u.username?.toLowerCase().includes(term) ?? false) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }

  getStatusClass(s: string): string {
    return s === 'Active'
      ? 'status-active'
      : s === 'Suspended'
        ? 'status-suspended'
        : 'status-inactive';
  }

  getRoleClass(r: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'role-super',
      TAX_COMMISSIONER: 'role-commissioner',
      TAX_OFFICER: 'role-officer',
      AUDITOR: 'role-auditor',
      DATA_ENTRY_OPERATOR: 'role-data',
      TAXPAYER: 'role-taxpayer',
    };
    return map[r] ?? '';
  }

  getRoleLabel(r: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      TAX_COMMISSIONER: 'Commissioner',
      TAX_OFFICER: 'Tax Officer',
      AUDITOR: 'Auditor',
      DATA_ENTRY_OPERATOR: 'Data Entry',
      TAXPAYER: 'Taxpayer',
    };
    return map[r] ?? r;
  }

  view(id: number): void {
    this.router.navigate(['/users/view', id]);
  }
  edit(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.users = this.users.filter((u) => u.id !== id);
    this.toast.success('User deleted successfully.');
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}
