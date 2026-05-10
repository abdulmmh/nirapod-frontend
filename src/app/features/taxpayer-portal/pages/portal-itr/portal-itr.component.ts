import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
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

  // ── returnUrl passed to child routes so they know where to come back ──
  // income-tax-return-create and income-tax-return-view both read this
  // query param in their onCancel() / onBack() methods.
  private readonly RETURN_URL = '/my-portal/itr';

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

  // ── Data ─────────────────────────────────────────────────────────────────

  private loadMyReturns(): void {
    this.isLoading = true;
    this.http
      .get<IncomeTaxReturn[]>(API_ENDPOINTS.INCOME_TAX_RETURNS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next:  (data)  => (this.returns = data),
        error: ()      => this.toast.error('Failed to load your returns.'),
      });
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  get filtered(): IncomeTaxReturn[] {
    if (!this.filterStatus) return this.returns;
    return this.returns.filter(r => r.status === this.filterStatus);
  }

  countByStatus(status: ITRStatus): number {
    return this.returns.filter(r => r.status === status).length;
  }

  get totalFiled():    number { return this.returns.length; }
  get totalAccepted(): number { return this.countByStatus('Accepted'); }
  get totalPending():  number {
    return this.returns.filter(r =>
      r.status === 'Submitted' || r.status === 'Under Review').length;
  }
  get totalOverdue():  number { return this.countByStatus('Overdue'); }

  netPayableOf(r: IncomeTaxReturn): number {
    return r.netTaxPayable ?? Math.max(0, (r.grossTax ?? 0) - (r.taxRebate ?? 0));
  }

  refundableOf(r: IncomeTaxReturn): number {
    const paid = (r.advanceTaxPaid ?? 0) + (r.withholdingTax ?? 0) + (r.taxPaid ?? 0);
    return r.refundable ?? Math.max(0, paid - this.netPayableOf(r));
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount)) return '৳ 0';
    if (amount >= 10_000_000) return `৳ ${(amount / 10_000_000).toFixed(2)} Cr`;
    if (amount >= 100_000)    return `৳ ${(amount / 100_000).toFixed(2)} L`;
    return `৳ ${amount.toLocaleString('en-BD')}`;
  }

  isOverdue(r: IncomeTaxReturn): boolean {
    if (!r.dueDate || r.status === 'Accepted') return false;
    return new Date(r.dueDate) < new Date();
  }

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

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate to the existing create component, passing returnUrl so that
   * onCancel() and goToList() in that component know to come back here
   * instead of going to the officer list.
   */
  fileNew(): void {
    this.router.navigate(
      ['/my-portal/income-tax-returns/create'],
      { queryParams: { returnUrl: this.RETURN_URL } }
    );
  }

  /**
   * Navigate to the existing view component, passing returnUrl so that
   * onBack() in that component comes back to the portal, not the officer list.
   */
  view(id: number): void {
    this.router.navigate(
      ['/my-portal/income-tax-returns/view', id],
      { queryParams: { returnUrl: this.RETURN_URL } }
    );
  }

  openIT10B(returnId: number): void {
    this.router.navigate(
      ['/my-portal/income-tax-returns', returnId, 'it10b'],
      { queryParams: { returnUrl: this.RETURN_URL } }
    );
  }

  get currentUser() {
    return this.authService.currentUser;
  }
}