import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { Business, BUSINESS_TYPE_MAP } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-view',
  templateUrl: './business-view.component.html',
  styleUrls: ['./business-view.component.css'],
})
export class BusinessViewComponent implements OnInit, OnDestroy {

  business: Business | null = null;
  businessId: number | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private toast:  ToastService,
  ) {}

  ngOnInit(): void { this.initializeBusiness(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────── Initialization ─────────────────────

  private initializeBusiness(): void {
    const id = this.getValidBusinessId();
    if (!id) { this.handleInvalidId(); return; }
    this.businessId = id;
    this.fetchBusiness();
  }

  private getValidBusinessId(): number | null {
    const rawId    = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);
    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid business ID. Please go back and try again.');
  }

  // ─────────────────── Data Fetching ───────────────────────

  private fetchBusiness(): void {
    if (!this.businessId) return;
    this.isLoading = true;
    this.http
      .get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next:  (data)  => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Business): void {
    this.business = data;
    this.handleBusinessNotifications(data);
  }

  private handleFetchError(error: unknown): void {
    console.error('Failed to load business details', error);
    this.toast.error('Failed to load business details. Please go back and try again.');
  }

  // ─────────────────── Notifications ─────────────────────

  private handleBusinessNotifications(data: Business): void {
    if (data.expiryDate && this.isExpired(data.expiryDate))
      this.toast.warning('This business license has expired.');
    else if (data.expiryDate && this.isExpiringSoon(data.expiryDate))
      this.toast.warning('This business license is expiring within 30 days.');

    if (data.status === 'Suspended' || data.status === 'Dissolved')
      this.toast.info(`This business is currently ${data.status}.`);
  }

  // ─────────────────── Navigation ──────────────────────────

  onEdit(): void {
    if (!this.business?.id) return;
    this.router.navigate(['/businesses/edit', this.business.id]);
  }

  onBack(): void { this.router.navigate(['/businesses']); }

  // ─────────────────── UI Helpers ───────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active:    'status-active',
      Inactive:  'status-inactive',
      Pending:   'status-pending',
      Suspended: 'status-suspended',
      Dissolved: 'status-inactive',
    };
    return map[status] ?? '';
  }


  getTypeName(type: string): string {
    return BUSINESS_TYPE_MAP[type] ?? type;
  }


  getDistrictName(): string {
    return this.business?.district?.name ?? '—';
  }

  getDivisionName(): string {
    return this.business?.division?.name ?? '—';
  }

  getCategoryIcon(category: string): string {
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
    return map[category] ?? 'bi bi-grid-fill';
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000)   return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }

  // ─────────────────── Date Helpers ──────────────────────

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < this.getToday();
  }

  isExpiringSoon(date: string): boolean {
    if (!date) return false;
    const diff = (new Date(date).getTime() - this.getToday().getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}