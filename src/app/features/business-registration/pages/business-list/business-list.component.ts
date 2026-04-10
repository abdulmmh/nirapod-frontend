import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Business } from '../../../../models/business.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css'],
})
export class BusinessListComponent implements OnInit, OnDestroy {

  // ────────────────── Properties ──────────────────

  businesses: Business[] = [];
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
    this.fetchBusinesses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────── Data Fetching  ────────────────────────

  private fetchBusinesses(): void {
    this.isLoading = true;

    this.http
      .get<Business[]>(API_ENDPOINTS.BUSINESSES.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
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
      this.toast.info(
        'No businesses registered yet. Click "Register Business" to add one.',
      );
    }
  }

  private notifyIfExpiringSoon(data: Business[]): void {
    const soon = data.filter((b) => this.isExpiringSoon(b.expiryDate));

    if (soon.length > 0) {
      this.toast.warning(
        `${soon.length} business license(s) expiring within 30 days.`,
      );
    }
  }

  // ────────────────── Filtering ──────────────────────

  get filteredBusinesses(): Business[] {
    if (!this.searchTerm.trim()) return this.businesses;

    const term = this.searchTerm.toLowerCase();

    return this.businesses.filter((b) => this.matchesSearch(b, term));
  }

  private matchesSearch(b: Business, term: string): boolean {
    return (
      b.businessName.toLowerCase().includes(term) ||
      b.businessRegNo.toLowerCase().includes(term) ||
      b.tinNumber.toLowerCase().includes(term) ||
      b.ownerName.toLowerCase().includes(term) ||
      b.businessType.toLowerCase().includes(term) ||
      b.district.toLowerCase().includes(term)
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

    this.deleteBusiness(id);
  }

  private deleteBusiness(id: number): void {
    this.isLoading = true;

    this.http
      .delete(API_ENDPOINTS.BUSINESSES.DELETE(id))
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



  view(id: number): void {
    this.router.navigate(['/businesses/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/businesses/edit', id]);
  }

  // ────────────── UI Helpers  ─────────────────────────

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

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'Sole Proprietorship': 'type-sole',
      Partnership: 'type-partner',
      'Private Limited': 'type-pvt',
      'Public Limited': 'type-pub',
      NGO: 'type-ngo',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      Manufacturing: 'bi bi-gear-fill',
      Trading: 'bi bi-bag-fill',
      Service: 'bi bi-briefcase-fill',
      Agriculture: 'bi bi-tree-fill',
      Construction: 'bi bi-building-fill',
      IT: 'bi bi-laptop-fill',
      Healthcare: 'bi bi-heart-pulse-fill',
      Education: 'bi bi-book-fill',
      Other: 'bi bi-grid-fill',
    };
    return map[category] ?? 'bi bi-grid-fill';
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }

//  ─────────────────── Date Helpers ───────────────────────

  isExpired(date: string): boolean {
    if (!date) return false;

    const today = this.getToday();
    return new Date(date) < today;
  }

  isExpiringSoon(date: string): boolean {
    if (!date) return false;

    const today = this.getToday();
    const expiry = new Date(date);

    const diff =
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= 30;
  }

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}