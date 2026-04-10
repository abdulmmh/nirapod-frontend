import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Tin } from '../../../../models/tin.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-tin-list',
  templateUrl: './tin-list.component.html',
  styleUrls: ['./tin-list.component.css']
})
export class TinListComponent implements OnInit {

  // ────────────────── Properties ──────────────────

  tins: Tin[] = [];
  searchTerm = '';
  isLoading  = false;

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
    this.fetchTines();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  // ───────────────── Data Fetching  ────────────────────────

  private fetchTines(): void {
    this.isLoading = true;

    this.http
      .get<Tin[]>(API_ENDPOINTS.TINS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Tin[]): void {
    this.tins = data;

    this.notifyIfEmpty(data);
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading TIN records:', error);
    this.toast.error('Failed to load TIN records. Please refresh the page.');
  }

  private notifyIfEmpty(data: Tin[]): void {
    if (data.length === 0) {
      this.toast.info(
        'No Tines registered yet. Click "Register Tin" to add one.',
      );
    }
  }

  // ────────────────── Filtering ──────────────────────

  get filteredTins(): Tin[] {
    if (!this.searchTerm.trim()) return this.tins;

    const term = this.searchTerm.toLowerCase();

    return this.tins.filter((t) =>this.matchesSearch(t, term));
  }

  private matchesSearch(t: Tin, term: string): boolean {
      return (
      t.tinNumber.toLowerCase().includes(term)      ||
      t.taxpayerName.toLowerCase().includes(term)   ||
      t.tinCategory.toLowerCase().includes(term)    ||
      t.taxZone.toLowerCase().includes(term)        ||
      t.district.toLowerCase().includes(term)
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

    this.deleteTin(id);
  }    


  private deleteTin(id: number): void {
    this.isLoading = true;

    this.http
      .delete(API_ENDPOINTS.TINS.DELETE(id))
      .pipe(takeUntil(this.destroy$),
       finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.tins = this.tins.filter((b) => b.id !== id);
    this.toast.success('TIN record deleted successfully.');
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete TIN record. Please try again.');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  // ─────────────────  Navigation  ───────────────────────
  
  view(id: number): void { this.router.navigate(['/tin/view', id]); }
  edit(id: number): void { this.router.navigate(['/tin/edit', id]); }


  // ────────────── UI Helpers  ─────────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'cat-individual',
      'Company':     'cat-company',
      'Partnership': 'cat-partner',
      'NGO':         'cat-ngo',
      'Government':  'cat-govt'
    };
    return map[c] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'bi bi-person-fill',
      'Company':     'bi bi-building-fill',
      'Partnership': 'bi bi-people-fill',
      'NGO':         'bi bi-heart-fill',
      'Government':  'bi bi-bank2'
    };
    return map[c] ?? 'bi bi-person-fill';
  }
}

