import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-ait-list',
  templateUrl: './ait-list.component.html',
  styleUrls: ['./ait-list.component.css'],
})
export class AitListComponent implements OnInit {
  // ──────────────── States ────────────────

  records: Ait[] = [];
  searchTerm = '';
  isLoading = false;

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
    this.fetchAits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────── Data Fetching  ────────────────────────

  private fetchAits(): void {
    this.isLoading = true;

    this.http
      .get<Ait[]>(API_ENDPOINTS.AITS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Ait[]): void {
    this.records = data;
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading AIT records', error);
    this.toast.error('Failed to load AIT records');
  }

  private notifyIfEmpty(data: Ait[]): void {
    if (data.length === 0) {
      this.toast.info('No AIT records found. Click "Register AIT" to add one');
    }
  }

  // ────────────────── Filtering ──────────────────────

  get filtered(): Ait[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();

    return this.records.filter((r) => this.matchesSearch(r, term));
  }

  private matchesSearch(r: Ait, term: string): boolean {
    return (
      r.status.toLowerCase().includes(term) ||
      r.aitRef.toLowerCase().includes(term) ||
      r.taxpayerName.toLowerCase().includes(term) ||
      r.tinNumber.toLowerCase().includes(term) ||
      r.sourceType.toLowerCase().includes(term) ||
      r.deductedBy.toLowerCase().includes(term)
    );
  }

  // ────────────────── Delete Flow ──────────────────────

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;

    const id = this.pendingDeleteId;
    this.resetDeleteState();

    this.deleteAit(id);
  }

  private deleteAit(id: number): void {
    this.isLoading = true;

    this.http
      .delete(API_ENDPOINTS.AITS.DELETE(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleDeleteSuccess(),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(): void {
    this.records = this.records.filter((r) => r.id !== this.pendingDeleteId);
    this.toast.success('AIT record deleted successfully');
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete AIT record');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  // ────────────────── Navigation ──────────────────────

  view(id: number): void {
    this.router.navigate(['/ait/view', id]);
  }
  edit(id: number): void {
    this.router.navigate(['/ait/edit', id]);
  }

  // ────────────────── Helpers ──────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Deducted: 'status-pending',
      Deposited: 'status-active',
      Credited: 'status-credited',
      Disputed: 'status-suspended',
    };
    return map[s] ?? '';
  }

  getSourceClass(s: string): string {
    const map: Record<string, string> = {
      Salary: 'src-salary',
      Import: 'src-import',
      Contract: 'src-contract',
      Interest: 'src-interest',
      Dividend: 'src-dividend',
      Commission: 'src-commission',
      Export: 'src-export',
    };
    return map[s] ?? '';
  }

  countByStatus(status: string): number {
    return this.records.filter((r) => r.status === status).length;
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString('en-BD')}`;
  }

  get totalAIT(): number {
    return this.records.reduce((s, r) => s + r.aitAmount, 0);
  }
}
