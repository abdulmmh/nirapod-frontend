import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Business, BUSINESS_TYPE_MAP } from '../../../../models/business.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { BusinessCategory, BusinessType } from 'src/app/models/master-data.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css'],
})
export class BusinessListComponent implements OnInit, OnDestroy {

  businesses: (Business)[] = [];
  searchTerm = '';
  isLoading = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  // ── Filters — matches Payment/ITR module's dropdown pattern ────────────────
  statusFilter   = '';
  typeFilter     = '';
  categoryFilter = '';

  readonly statusOptions: string[] = ['Active', 'Inactive', 'Pending', 'Suspended', 'Dissolved'];
  readonly typeOptions: string[] = [
    'Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'NGO', 'Other',
  ];
  readonly categoryOptions: string[] = [
    'Manufacturing', 'Trading', 'Service', 'Agriculture',
    'Construction', 'IT', 'Healthcare', 'Education', 'Other',
  ];

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    this.fetchBusinesses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────── Data Fetching ─────────────────────────

  private fetchBusinesses(): void {
    this.isLoading = true;
    const role       = this.authService.userRole;
    const taxpayerId = this.authService.currentUser?.taxpayerId;

    const url = (role === Role.TAXPAYER && taxpayerId)
      ? API_ENDPOINTS.BUSINESSES.BY_TAXPAYER_VAT_STATUS(taxpayerId)
      : API_ENDPOINTS.BUSINESSES.LIST;

    this.http.get<Business[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next:  data  => this.handleFetchSuccess(data),
        error: error => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Business[]): void {
    this.businesses = data;
    this.notifyIfEmpty(data);
    this.notifyIfExpiringSoon(data);
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading businesses:', error);
    this.toast.error('Failed to load businesses. Please refresh the page.');
  }

  private notifyIfEmpty(data: Business[]): void {
    if (data.length === 0) {
      this.toast.info('No businesses registered yet. Click "Register Business" to add one.');
    }
  }

  private notifyIfExpiringSoon(data: Business[]): void {
    const soon = data.filter((b) => this.isExpiringSoon(b.expiryDate!));
    if (soon.length > 0) {
      this.toast.warning(`${soon.length} business license(s) expiring within 30 days.`);
    }
  }

  // ── KPI Summary Cards — mirrors Payment/ITR module's card row ──────────────

  get kpiActive(): number {
    return this.businesses.filter((b) => b.status === 'Active').length;
  }

  get kpiPending(): number {
    return this.businesses.filter((b) => b.status === 'Pending').length;
  }

  get kpiSuspended(): number {
    return this.businesses.filter((b) => b.status === 'Suspended').length;
  }

  get kpiExpiringSoon(): number {
    return this.businesses.filter((b) => this.isExpiringSoon(b.expiryDate!)).length;
  }

  get kpiTotalTurnover(): number {
    return this.businesses
      .filter((b) => b.status === 'Active')
      .reduce((sum, b) => sum + (b.annualTurnover || 0), 0);
  }

  // ────────────────── Filtering ──────────────────────

  get filteredBusinesses(): Business[] {
    let result = this.businesses;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((b) => this.matchesSearch(b, term));
    }

    if (this.statusFilter) {
      result = result.filter((b) => b.status === this.statusFilter);
    }
    if (this.typeFilter) {
      result = result.filter((b) => this.getTypeName(b.businessType) === this.typeFilter);
    }
    if (this.categoryFilter) {
      result = result.filter((b) => this.getCategoryName(b.businessCategory) === this.categoryFilter);
    }

    return result;
  }

  private matchesSearch(b: Business, term: string): boolean {
    return (
      b.businessName.toLowerCase().includes(term) ||
      b.businessRegNo.toLowerCase().includes(term) ||
      (b.tinNumber?.toLowerCase().includes(term) ?? false) ||
      (b.ownerName?.toLowerCase().includes(term) ?? false) ||
      this.getTypeName(b.businessType).toLowerCase().includes(term) ||

      (b.district?.name?.toLowerCase().includes(term) ?? false) ||
      (b.division?.name?.toLowerCase().includes(term) ?? false)
    );
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.typeFilter || this.categoryFilter);
  }

  clearFilters(): void {
    this.searchTerm     = '';
    this.statusFilter   = '';
    this.typeFilter     = '';
    this.categoryFilter = '';
    this.currentPage    = 1;
  }

  /** Called when a clickable KPI status card is clicked — toggles filter. */
  onKpiCardClick(status: string): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.currentPage  = 1;
  }

  /** Returns true when a given status card is the active filter. */
  isKpiActive(status: string): boolean {
    return this.statusFilter === status;
  }

  /** Any filter/search change resets back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBusinesses.length / this.pageSize));
  }

  get paginatedBusinesses(): Business[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBusinesses.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filteredBusinesses.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredBusinesses.length);
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
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
    this.deleteBusiness(id);
  }

  private deleteBusiness(id: number): void {
    this.isLoading = true;
    this.http
      .delete(API_ENDPOINTS.BUSINESSES.DELETE(id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.businesses = this.businesses.filter((b) => b.id !== id);
    this.toast.success('Business deleted successfully.');
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete business. Please try again.');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

// ───────────────── Navigation ───────────────────────

  view(id: number): void {
    this.router.navigate(['view', id], {
      relativeTo: this.route
    });
  }

  edit(id: number): void {
    this.router.navigate(['edit', id], {
      relativeTo: this.route
    });
  }

  
  navigateToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route
    });
  }

  // ────────────── UI Helpers  ─────────────────────────


  getTypeName(b: any): string {
    if (b && typeof b === 'object' && b.typeName) return b.typeName;
    if (b && typeof b === 'object' && b.businessTypeName) return b.businessTypeName;
    if (typeof b === 'string') return BUSINESS_TYPE_MAP[b] ?? b;
    return '—';
  }

  getCategoryName(b: any): string {
    if (b && typeof b === 'object' && b.categoryName) return b.categoryName;
    if (b && typeof b === 'object' && b.businessCategoryName) return b.businessCategoryName;
    if (typeof b === 'string') return b;
    return '—';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Inactive: 'status-inactive',
      Pending: 'status-pending',
      Suspended: 'status-suspended',
      Dissolved: 'status-inactive',
    };
    return map[status] ?? '';
  }

  getTypeClass(type: BusinessType): string {
    const name = this.getTypeName(type);
    const map: Record<string, string> = {
      'Sole Proprietorship': 'type-sole',
      'Partnership':         'type-partner',
      'Private Limited':     'type-pvt',
      'Public Limited':      'type-pub',
      'NGO':                 'type-ngo',
      'Other':               'type-other',
    };
    return map[name] ?? '';
  }

  getCategoryIcon(category: BusinessCategory): string {
    const categoryName = this.getCategoryName(category); 
    
    const map: Record<string, string> = {
      Manufacturing: 'bi bi-gear-fill',
      Trading:       'bi bi-bag-fill',
      Service:       'bi bi-briefcase-fill',
      Agriculture:   'bi bi-tree-fill',
      Construction:  'bi bi-building-fill',
      IT:            'bi bi-laptop-fill',
      Healthcare:    'bi bi-heart-pulse-fill',
      Education:     'bi bi-book-fill',
      Other:         'bi bi-grid-fill',
    };

    return map[categoryName] ?? 'bi bi-grid-fill'; 
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000)   return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }


  getDistrictName(b: Business): string {
    return b.district?.name         
      ?? (b as any).districtName     
      ?? '—';
  }

  getDivisionName(b: Business): string {
    return b.division?.name
      ?? (b as any).divisionName
      ?? '—';
  }

  // ─────────────────── Date Helpers ───────────────────────

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < this.getToday();
  }

  isExpiringSoon(date: string): boolean {
    if (!date) return false;
    const today  = this.getToday();
    const expiry = new Date(date);
    const diff   = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}