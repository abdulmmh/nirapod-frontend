import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-list',
  templateUrl: './taxpayer-list.component.html',
  styleUrls: ['./taxpayer-list.component.css'],
})
export class TaxpayerListComponent implements OnInit, OnDestroy {
  // ────────────────── Properties ──────────────────
  taxpayers: Taxpayer[] = [];
  searchTerm = '';
  isLoading = false;
  isExporting = false;

  private destroy$ = new Subject<void>();

  showDeleteModal = false;
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

    this.http
      .get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST)
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
      // this.taxpayers = data.filter(tp => tp.status !== 'Inactive');
      this.notifyIfEmpty(data);
  }
  
    private handleFetchError(error: unknown): void {
      console.error('Error loading taxpayers:', error);
      this.toast.error('Failed to load taxpayers. Please refresh the page.');
    }
  
    private notifyIfEmpty(data: Taxpayer[]): void {
      if (data.length === 0) {
        this.toast.info('No taxapyers registered yet. Click "Register taxpayers" to add one.');
      }
    }

  // ─────────────────── Helper Methods ────────────────────────

  getDisplayName(taxpayer: any): string {
    const typeName = taxpayer?.taxpayerType?.typeName?.toLowerCase() || '';
  
    if (typeName.includes('company')) {
      return taxpayer.companyName || 'Unknown Company';
    } 
    else {
      return taxpayer.fullName || 'Unknown Individual'; 
    }
  }

  // ─────────────────── Filtering ────────────────────────

  get filteredTaxpayers(): Taxpayer[] {
    if (!this.searchTerm.trim()) {
      return this.taxpayers;
    }
    const term = this.searchTerm.toLowerCase();
    return this.taxpayers.filter((tp) => this.matchesSearchTerm(tp, term));
  }

  private matchesSearchTerm(tp: Taxpayer, term: string): boolean {
    const name = this.getDisplayName(tp).toLowerCase();
    const tin = tp.tinNumber ? tp.tinNumber.toLowerCase() : '';
    const email = tp.email ? tp.email.toLowerCase() : '';
    const phone = tp.phone ? tp.phone : '';

    return (
      name.includes(term) ||
      tin.includes(term) ||
      email.includes(term) ||
      phone.includes(term)
    );
  }

  // ─────────────────── Delete Flow ────────────────────────

  confirmDelete(id: number | undefined): void {
    if (!id) return;
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
    this.deleteTaxpayer(id);
  }

  private deleteTaxpayer(id: number): void {
    this.isLoading = true;
    this.http
      .delete(API_ENDPOINTS.TAXPAYERS.DELETE(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.taxpayers = this.taxpayers.filter((tp) => tp.id !== id);
    this.toast.success('Taxpayer deleted successfully.');
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete taxpayer. Please try again.');
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  // ─────────────────── Pagination / Routing ─────────────────────────

  viewTaxpayers(id: number | undefined): void {
    if(id) this.router.navigate(['/taxpayers/view', id]);
  }

  editTaxpayers(id: number | undefined): void {
    if(id) this.router.navigate(['/taxpayers/edit', id]);
  }

  // ─────────────────── Export Section ─────────────────────────
 
  onExport(): void {
    this.isExporting = true;
    
    this.http.get(API_ENDPOINTS.TAXPAYERS.EXPORT, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Taxpayer_List_Export_${new Date().toISOString().split('T')[0]}.csv`; 
          document.body.appendChild(a);
          a.click();
          
          // Memory cleanup
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          this.isExporting = false;
          this.toast.success('Taxpayer data exported successfully!');
        },
        error: () => {
          this.isExporting = false;
          this.toast.error('Failed to export Taxpayer data.');
        }
      });
  }
 
  // ─────────────────── UI Helpers ─────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Inactive: 'status-inactive',
      Pending: 'status-pending',
      Suspended: 'status-suspended',
    };
    return map[status] ?? '';
  }
}