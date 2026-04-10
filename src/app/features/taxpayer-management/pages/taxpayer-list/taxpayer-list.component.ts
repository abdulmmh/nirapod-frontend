import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-list',
  templateUrl: './taxpayer-list.component.html',
  styleUrls: ['./taxpayer-list.component.css']
})
export class TaxpayerListComponent implements OnInit {

// ────────────────── Properties ──────────────────
  taxpayers: Taxpayer[] = [];
  searchTerm = '';
  isLoading  = false;

  private destroy$ = new Subject<void>();
  
  showDeleteModal  = false;
  pendingDeleteId: number | null = null;


  // ──────────────Constructor  ───────────────────

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ─────────────── Lifecycle  ───────────────────
  ngOnInit(): void {
    this.fetchTaxpayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // ───────────────── Data Fetching  ────────────────────────

  private fetchTaxpayer(): void {
    this.isLoading = true;

    this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Taxpayer[]): void {
    this.taxpayers = data;

    this.notifyIfEmpty(data);
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading taxpayers:', error);
    this.toast.error('Failed to load taxpayers. Please refresh the page.');
  }

  private notifyIfEmpty(data: Taxpayer[]): void {
    if (data.length === 0) {
      this.toast.info(
        'No taxpayers registered yet. Click "Register Taxpayer" to add one.',
      );
    }
  }

  // ─────────────────── Filtering  ─────────────────────────

  get filteredTaxpayers(): Taxpayer[] {
    if (!this.searchTerm.trim()) return this.taxpayers;

    const term = this.searchTerm.toLowerCase();

    return this.taxpayers.filter((tp) => this.matchesSearchTerm(tp, term));
  }

  private matchesSearchTerm(tp: Taxpayer, term: string): boolean {
    return (
      tp.fullName.toLowerCase().includes(term) ||
      tp.tin.toLowerCase().includes(term)      ||
      tp.email.toLowerCase().includes(term)    ||
      tp.phone.includes(term)
    );
  }

  // ─────────────────── Delete Flow ─────────────────────────

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

    this.deleteTaxpayer(id);
  }


  private deleteTaxpayer(id: number): void {
    if (this.pendingDeleteId === null) return;

    this.http.delete(API_ENDPOINTS.TAXPAYERS.DELETE(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
       .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.taxpayers = this.taxpayers.filter((tp) => tp.id !== id);
    this.toast.success('Taxpayer deleted successfully.');
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete taxpayer. Please try again.');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  // ─────────────────── Pagination ─────────────────────────

   viewTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/view' , id]);
  }

  editTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/edit', id]);
  }


  // ─────────────────── UI Helpers ─────────────────────────
  
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active':    'status-active',
      'Inactive':  'status-inactive',
      'Pending':   'status-pending',
      'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }

 
}