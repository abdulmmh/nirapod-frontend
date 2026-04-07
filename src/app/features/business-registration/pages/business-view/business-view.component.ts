import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Business } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-view',
  templateUrl: './business-view.component.html',
  styleUrls: ['./business-view.component.css']
})
export class BusinessViewComponent implements OnInit, OnDestroy {

  business: Business | null = null;
  isLoading  = true;
  businessId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private toast:  ToastService
  ) {}

  ngOnInit(): void {
    const rawId    = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid business ID. Please go back and try again.');
      return;
    }

    this.businessId = parsedId;
    this.loadBusiness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────────

  loadBusiness(): void {
    this.isLoading = true;

    this.http.get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId!))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.business  = data;
          this.isLoading = false;

          // WARNING: expired license
          if (data.expiryDate && this.isExpired(data.expiryDate)) {
            this.toast.warning('This business license has expired.');
          }

          // INFO: suspended or dissolved status
          if (data.status === 'Suspended' || data.status === 'Dissolved') {
            this.toast.info(`This business is currently ${data.status}.`);
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load business details. Please go back and try again.');
        }
      });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────────

  onEdit(): void {
    if (!this.business?.id) return;
    this.router.navigate(['/businesses/edit', this.business.id]);
  }

  onBack(): void { this.router.navigate(['/businesses']); }

  // ─── Helper Methods ───────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active':    'status-active',
      'Inactive':  'status-inactive',
      'Pending':   'status-pending',
      'Suspended': 'status-suspended',
      'Dissolved': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Manufacturing': 'bi bi-gear-fill',
      'Trading':       'bi bi-bag-fill',
      'Service':       'bi bi-briefcase-fill',
      'Agriculture':   'bi bi-tree-fill',
      'Construction':  'bi bi-building-fill',
      'IT':            'bi bi-laptop-fill',
      'Healthcare':    'bi bi-heart-pulse-fill',
      'Education':     'bi bi-book-fill',
      'Other':         'bi bi-grid-fill'
    };
    return map[c] ?? 'bi bi-grid-fill';
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000)   return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }
}