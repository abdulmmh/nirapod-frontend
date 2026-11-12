import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivityLog } from 'src/app/models/activity-logs.model';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-activity-logs-list',
  templateUrl: './activity-logs-list.component.html',
  styleUrls: ['./activity-logs-list.component.css'],
})
export class ActivityLogsListComponent implements OnInit, OnDestroy {
  logs: ActivityLog[] = [];
  searchTerm = '';
  filterType = '';
  filterDate = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  actionTypes = [
    '',
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'VIEW',
  ];

  constructor(private toast: ToastService) {}



  ngOnInit(): void {
    this.isLoading = true;
    timer(400).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.logs = [];
      this.toast.warning('Activity history is not available in this demo.');
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filtered(): ActivityLog[] {
    return this.logs.filter((log) => {
      const matchSearch =
        !this.searchTerm ||
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
      CREATE: 'act-create',
      UPDATE: 'act-update',
      DELETE: 'act-delete',
      LOGIN: 'act-login',
      LOGOUT: 'act-logout',
      EXPORT: 'act-export',
      VIEW: 'act-view',
    };
    return map[a] ?? '';
  }

  getActionIcon(a: string): string {
    const map: Record<string, string> = {
      CREATE: 'bi bi-plus-circle-fill',
      UPDATE: 'bi bi-pencil-fill',
      DELETE: 'bi bi-trash-fill',
      LOGIN: 'bi bi-box-arrow-in-right',
      LOGOUT: 'bi bi-box-arrow-right',
      EXPORT: 'bi bi-download',
      VIEW: 'bi bi-eye-fill',
    };
    return map[a] ?? 'bi bi-circle-fill';
  }

  getStatusClass(s: string): string {
    return s === 'Success'
      ? 'status-active'
      : s === 'Warning'
        ? 'status-pending'
        : 'status-suspended';
  }

  // component e add koro
  countByStatus(status: string): number {
    return this.logs.filter((l) => l.status === status).length;
  }

  exportLogs(): void {
    this.toast.success('Activity logs exported successfully.');
  }
}
