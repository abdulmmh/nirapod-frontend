import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-registration-view',
  templateUrl: './vat-registration-view.component.html',
  styleUrls: ['./vat-registration-view.component.css']
})
export class VatRegistrationViewComponent implements OnInit, OnDestroy {

  vat: VatRegistration | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(id: number): void {
    this.isLoading = true;
    this.http.get<VatRegistration>(API_ENDPOINTS.VAT_REGISTRATIONS.GET(id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => { this.vat = data; },
        error: () => {
          this.toast.error('Failed to load VAT registration details.');
          this.router.navigate(['/vat-registration']);
        }
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

  formatCurrency(a: number): string { return `৳${a.toLocaleString()}`; }

  onEdit(): void { this.router.navigate(['/vat-registration/edit', this.vat?.id]); }
  onBack(): void { this.router.navigate(['/vat-registration']); }
}
