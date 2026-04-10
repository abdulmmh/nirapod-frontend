import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.css']
})
export class AuditListComponent implements OnInit {

  // ────────────────── State ──────────────────
  audits: Audit[] = [];
  searchTerm = '';
  isLoading  = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  // ──────────────Constructor  ───────────────────
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ─────────────── Lifecycle  ───────────────────

  ngOnInit(): void {
    this.fetchAudit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────── Data Fetching  ────────────────────────
  
  private fetchAudit(): void {
    this.isLoading = true;

    this.http
      .get<Audit[]>(API_ENDPOINTS.AUDITS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (err) => this.handleFetchError(err),
      });
  }

  private handleFetchSuccess(data: Audit[]): void {
    this.audits = data;
  }

  private handleFetchError(err: any): void {
    console.error('Error fetching audits:', err);
    this.toast.error('Failed to load audits. Please try again.');
  }

  private notifyIfEmpty(data: Audit[]): void {
    if (data.length === 0) {
      this.toast.info(
        'No audits found. Click "Register Audit" to add one');
    }
  }

  // ────────────────── Filtering ──────────────────────

  get filteredAudits(): Audit[] {
    if (!this.searchTerm.trim()) return this.audits;

    const term = this.searchTerm.toLowerCase();

    return this.audits.filter((a) => this.matchesSearchTerm(a, term));
  }

  private matchesSearchTerm(a: Audit, term: string): boolean {
    return (
      a.id.toString().includes(term) ||
      a.auditNo.toLowerCase().includes(term)       ||
      a.taxpayerName.toLowerCase().includes(term)  ||
      a.tinNumber.toLowerCase().includes(term)     ||
      a.auditType.toLowerCase().includes(term)     ||
      a.assignedTo.toLowerCase().includes(term)
    );
  }


  // ──────────────── Delete Flow  ─────────────────
  
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

    this.deleteAudit(id);
  }


  private deleteAudit(id: number): void {
    this.isLoading = true;

    this.http
      .delete(API_ENDPOINTS.AUDITS.DELETE(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: (err) => this.handleDeleteError(err),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.audits = this.audits.filter((a) => a.id !== id);
    this.toast.success('Audit deleted successfully');
  }

  private handleDeleteError(err: any): void {
    console.error('Error deleting audit:', err);
    this.toast.error('Failed to delete audit. Please try again.');
  }
  
  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }


  // ─────────────────  Navigation  ───────────────────────

  viewAudit(id: number): void   { this.router.navigate(['/audits', id]); }
  editAudit(id: number): void   { this.router.navigate(['/audits', id, 'edit']); }

  // ──────────────── UI Helpers ───────────────────
  
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Scheduled':   'status-scheduled',
      'In Progress': 'status-progress',
      'Completed':   'status-active',
      'Flagged':     'status-flagged',
      'Cancelled':   'status-inactive',
      'Pending':     'status-pending'
    };
    return map[status] ?? '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Low':      'pri-low',
      'Medium':   'pri-medium',
      'High':     'pri-high',
      'Critical': 'pri-critical'
    };
    return map[priority] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT Audit':        'type-vat',
      'Income Tax Audit': 'type-it',
      'Full Audit':       'type-full',
      'Desk Audit':       'type-desk',
      'Field Audit':      'type-field',
      'Special Audit':    'type-special'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount === 0) return '—';
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }
}