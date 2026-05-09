import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn, ITRStatus } from '../../../../models/income-tax-return.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-portal-itr',
  templateUrl: './portal-itr.component.html',
  styleUrls: ['./portal-itr.component.css'],
})
export class PortalItrComponent implements OnInit, OnDestroy {

  returns: IncomeTaxReturn[] = [];
  isLoading = true;
  filterStatus = '';

  readonly statuses: ITRStatus[] = [
    'Draft', 'Submitted', 'Under Review', 'Accepted',
    'Rejected', 'Overdue', 'Amended', 'Send Back',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMyReturns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ──────────────────────────────────────────────

  private loadMyReturns(): void {
    this.isLoading = true;
    const taxpayerId = this.authService.currentUser?.taxpayerId;
    const url = `${API_ENDPOINTS.INCOME_TAX_RETURNS.LIST}?taxpayerId=${taxpayerId}`;
    this.http.get<IncomeTaxReturn[]>(url)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => (this.returns = data),
        error: () => this.toast.error('Failed to load your returns.'),
    });
  }

  // ── Computed helpers ──────────────────────────────────────────

  get filtered(): IncomeTaxReturn[] {
    if (!this.filterStatus) return this.returns;
    return this.returns.filter((r) => r.status === this.filterStatus);
  }

  countByStatus(status: ITRStatus): number {
    return this.returns.filter((r) => r.status === status).length;
  }

  get totalFiled(): number    { return this.returns.length; }
  get totalAccepted(): number { return this.countByStatus('Accepted'); }
  get totalPending(): number  {
    return this.returns.filter((r) =>
      r.status === 'Submitted' || r.status === 'Under Review',
    ).length;
  }
  get totalOverdue(): number  { return this.countByStatus('Overdue'); }

  netPayableOf(r: IncomeTaxReturn): number {
    return r.netTaxPayable ?? Math.max(0, (r.grossTax ?? 0) - (r.taxRebate ?? 0));
  }

  refundableOf(r: IncomeTaxReturn): number {
    const paid = (r.advanceTaxPaid ?? 0) + (r.withholdingTax ?? 0) + (r.taxPaid ?? 0);
    return r.refundable ?? Math.max(0, paid - this.netPayableOf(r));
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount)) return '৳0';
    if (amount >= 10_000_000) return `৳${(amount / 10_000_000).toFixed(2)} Cr`;
    if (amount >= 100_000)    return `৳${(amount / 100_000).toFixed(2)} L`;
    return `৳${amount.toLocaleString('en-BD')}`;
  }

  isOverdue(r: IncomeTaxReturn): boolean {
    if (!r.dueDate || r.status === 'Accepted') return false;
    return new Date(r.dueDate) < new Date();
  }

  // ── Navigation ────────────────────────────────────────────────

  fileNew(): void {
    this.router.navigate(['/income-tax-returns/create']);
  }

  view(id: number): void {
    this.router.navigate(['/income-tax-returns/view', id]);
  }

  openIT10B(returnId: number): void {
    this.router.navigate(['/income-tax-returns', returnId, 'it10b']);
  }

  // ── Status badge helper ───────────────────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft:          'status-draft',
      Submitted:      'status-submitted',
      'Under Review': 'status-review',
      Accepted:       'status-accepted',
      Rejected:       'status-rejected',
      Overdue:        'status-overdue',
      Amended:        'status-amended',
      'Send Back':    'status-sendback',
    };
    return map[status] ?? '';
  }

  // ── Current user ──────────────────────────────────────────────

  get currentUser() {
    return this.authService.currentUser;
  }
}