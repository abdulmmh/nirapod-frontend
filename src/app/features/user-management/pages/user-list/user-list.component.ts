import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/models/user.model';
import {
  getRoleClass,
  getRoleLabel,
  getStatusClass,
} from 'src/app/shared/helpers/role-display.helper';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {

  users: User[] = [];
  searchTerm       = '';
  isLoading        = false;
  showDeleteModal  = false;
  pendingDeleteId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router:      Router,
    private toast:       ToastService,
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
          this.users     = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load users.');
        },
      });
  }

  get filtered(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        (u.username?.toLowerCase().includes(term) ?? false) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }

  // Delegate to shared helpers — no duplication
  getRoleClass   = getRoleClass;
  getRoleLabel   = getRoleLabel;
  getStatusClass = getStatusClass;

  view(id: number): void { this.router.navigate(['/users/view', id]); }
  edit(id: number): void { this.router.navigate(['/users/edit', id]); }

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
    // Optimistic UI: remove from list immediately
    const snapshot = [...this.users];
    this.users = this.users.filter((u) => u.id !== id);

    this.userService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('User deleted successfully.');
        },
        error: (err) => {
          // Rollback optimistic update on failure
          this.users = snapshot;
          const message = err?.error?.message || 'Failed to delete user.';
          this.toast.error(message);
        },
      });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}