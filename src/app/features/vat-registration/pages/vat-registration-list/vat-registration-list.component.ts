import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-registration-list',
  templateUrl: './vat-registration-list.component.html',
  styleUrls: ['./vat-registration-list.component.css']
})
export class VatRegistrationListComponent implements OnInit, OnDestroy {

  vatRegistrations: VatRegistration[] = [];
  searchTerm   = '';
  filterStatus = '';
  isLoading    = false;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.loadData(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.http.get<VatRegistration[]>(API_ENDPOINTS.VAT_REGISTRATIONS.LIST)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => { this.vatRegistrations = data; },
        error: () => { this.toast.error('Failed to load VAT registrations.'); }
      });
  }

  get filtered(): VatRegistration[] {
    return this.vatRegistrations.filter(v => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        v.binNo.toLowerCase().includes(q)          ||
        v.businessName.toLowerCase().includes(q)   ||
        v.tinNumber.toLowerCase().includes(q)       ||
        v.ownerName.toLowerCase().includes(q)       ||
        v.vatCategory.toLowerCase().includes(q)     ||
        v.district.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || v.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active':    'status-active',
      'Inactive':  'status-inactive',
      'Pending':   'status-pending',
      'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Standard':   'cat-standard',
      'Zero Rated': 'cat-zero',
      'Exempt':     'cat-exempt',
      'Special':    'cat-special'
    };
    return map[c] ?? '';
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/vat-registration/view', id]); }
  edit(id: number): void { this.router.navigate(['/vat-registration/edit', id]); }

  delete(id: number, businessName: string): void {
    if (!confirm(`Delete VAT registration for "${businessName}"? This action cannot be undone.`)) return;

    this.http.delete(API_ENDPOINTS.VAT_REGISTRATIONS.DELETE(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vatRegistrations = this.vatRegistrations.filter(v => v.id !== id);
          this.toast.success(`VAT registration for "${businessName}" deleted successfully.`);
        },
        error: () => {
          this.toast.error('Failed to delete VAT registration. Please try again.');
        }
      });
  }
}
