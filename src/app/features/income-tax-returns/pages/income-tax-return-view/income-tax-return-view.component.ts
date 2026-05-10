import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-income-tax-return-view',
  templateUrl: './income-tax-return-view.component.html',
  styleUrls: ['./income-tax-return-view.component.css'],
})
export class IncomeTaxReturnViewComponent implements OnInit, OnDestroy {

  itr: IncomeTaxReturn | null = null;
  isLoading = true;
  isActing = false;

  showActionModal = false;
  currentAction = '';
  actionRemarks = '';
  actionError = '';

  Role = Role;

  readonly statusMap: Record<string, string> = {
    Submit: 'Submitted',
    'Start Review': 'Under Review',
    Accept: 'Accepted',
    Reject: 'Rejected',
    'Send Back': 'Send Back',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private toast: ToastService,
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
    this.http.get<IncomeTaxReturn>(API_ENDPOINTS.INCOME_TAX_RETURNS.GET(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => (this.itr = data),
        error: () => {
          this.toast.error('Failed to load income tax return.');
          this.router.navigate(['/income-tax-returns']);
        },
      });
  }

  canSubmit(): boolean {
    return this.itr?.status === 'Draft' || this.itr?.status === 'Send Back';
  }

  canStartReview(): boolean {
    return this.itr?.status === 'Submitted' && this.authService.hasRole(Role.TAX_OFFICER);
  }

  canAccept(): boolean {
    return this.itr?.status === 'Under Review' &&
      (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN));
  }

  canReject(): boolean {
    return this.canAccept();
  }

  canSendBack(): boolean {
    return this.itr?.status === 'Under Review' &&
      (this.authService.hasRole(Role.TAX_OFFICER) ||
        this.authService.hasRole(Role.TAX_COMMISSIONER));
  }

  openAction(action: string): void {
    this.currentAction = action;
    this.actionRemarks = '';
    this.actionError = '';
    this.showActionModal = true;
  }

  closeModal(): void {
    this.showActionModal = false;
    this.currentAction = '';
    this.actionRemarks = '';
    this.actionError = '';
  }

  confirmAction(): void {
    if (!this.itr || !this.currentAction) return;

    if (
      (this.currentAction === 'Reject' || this.currentAction === 'Send Back') &&
      !this.actionRemarks.trim()
    ) {
      this.actionError = 'Remarks are required for this action.';
      return;
    }

    const payload = {
      status: this.statusMap[this.currentAction],
      remarks: this.actionRemarks,
      action: this.currentAction,
      performedBy: this.authService.currentUser?.email ?? 'unknown',
      role: this.authService.userRole ?? 'UNKNOWN',
    };

    this.isActing = true;
    this.actionError = '';

    this.http.patch<IncomeTaxReturn>(
      API_ENDPOINTS.INCOME_TAX_RETURNS.UPDATE_STATUS(this.itr.id),
      payload,
    )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isActing = false)),
      )
      .subscribe({
        next: (updatedData) => {
          this.itr = updatedData;
          this.toast.success(this.actionSuccessMessage(this.currentAction));
          this.closeModal();
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Failed to update status. Please try again.');
        },
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Submitted: 'status-pending',
      'Under Review': 'status-review',
      Accepted: 'status-active',
      Rejected: 'status-suspended',
      Overdue: 'status-overdue',
      Amended: 'status-amended',
      'Send Back': 'status-sendback',
    };
    return map[status] ?? '';
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      Individual: 'cat-individual',
      Company: 'cat-company',
      Partnership: 'cat-partner',
      NGO: 'cat-ngo',
    };
    return map[category] ?? '';
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'Return Filed': 'bi bi-send-fill',
      'Return Submitted': 'bi bi-send-fill',
      'Review Started': 'bi bi-search',
      'Return Accepted': 'bi bi-check-circle-fill',
      'Return Rejected': 'bi bi-x-circle-fill',
      'Sent Back for Correction': 'bi bi-arrow-return-left',
    };
    return map[action] ?? 'bi bi-circle-fill';
  }

  getActionColor(toStatus: string): string {
    const map: Record<string, string> = {
      Submitted: 'tl-blue',
      'Under Review': 'tl-purple',
      Accepted: 'tl-green',
      Rejected: 'tl-red',
      'Send Back': 'tl-orange',
    };
    return map[toStatus] ?? 'tl-gray';
  }

  private get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl')
      || '/income-tax-returns';
  }

  get taxableIncome(): number {
    return this.itr?.taxableIncome ?? Math.max(0, (this.itr?.grossIncome || 0) - (this.itr?.exemptIncome || 0));
  }

  get netTaxPayable(): number {
    return this.itr?.netTaxPayable ?? Math.max(0, (this.itr?.grossTax || 0) - (this.itr?.taxRebate || 0));
  }

  get refundable(): number {
    const totalPaid =
      (this.itr?.advanceTaxPaid || 0) +
      (this.itr?.withholdingTax || 0) +
      (this.itr?.taxPaid || 0);
    return this.itr?.refundable ?? Math.max(0, totalPaid - this.netTaxPayable);
  }

  fmt(amount: number | null | undefined): string {
    return `BDT ${(amount || 0).toLocaleString('en-BD')}`;
  }

  private actionSuccessMessage(action: string): string {
    const map: Record<string, string> = {
      Submit: 'Return submitted successfully!',
      'Start Review': 'Review started successfully!',
      Accept: 'Return accepted successfully!',
      Reject: 'Return rejected successfully!',
      'Send Back': 'Return sent back successfully!',
    };
    return map[action] ?? 'Return status updated successfully!';
  }

  onEdit(): void {
    this.router.navigate(['/income-tax-returns/edit', this.itr?.id]);
  }

  onBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.router.navigateByUrl(returnUrl || '/income-tax-returns');
  }

  goToIT10B(): void {
    if (this.itr?.id) {
      // Pass returnUrl forward to IT10B page so its back button also works
      this.router.navigate(
        ['/income-tax-returns', this.itr.id, 'it10b'],
        {
          queryParams: {
            returnNo:  this.itr.returnNo,
            returnUrl: this.returnUrl,
          }
        }
      );
    }
  }
}
