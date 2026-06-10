import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.css'],
})
export class PaymentViewComponent implements OnInit, OnDestroy {
  payment: Payment | null = null;
  isLoading = true;
  isActing = false;
  showActionModal = false;
  currentAction = '';
  actionRemarks = '';
  actionError = '';

  Role = Role;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = Number(rawId);
    if (!rawId || isNaN(id) || id <= 0) {
      this.toast.error('Invalid payment ID.');
      this.router.navigate(['/payments']);
      return;
    }
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(id: number): void {
    this.isLoading = true;
    this.http
      .get<Payment>(API_ENDPOINTS.PAYMENTS.GET(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.payment = data;
        },
        error: () => {
          this.toast.error('Failed to load payment details.');
          this.router.navigate(['/payments']);
        },
      });
  }

  // ── Workflow Permission Checks ──────────────────────────────────────────────
  // Officer:    Pending → Under Review  |  Pending → Failed
  // Supervisor / Commissioner / Admin:
  //             Under Review → Completed | Under Review → Failed

  canMarkUnderReview(): boolean {
    return (
      this.payment?.status === 'Pending' &&
      (this.authService.hasRole(Role.TAX_OFFICER) ||
        this.authService.hasRole(Role.SUPERVISOR) ||
        this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN))
    );
  }

  canApprove(): boolean {
    return (
      this.payment?.status === 'Under Review' &&
      (this.authService.hasRole(Role.SUPERVISOR) ||
        this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN))
    );
  }

  canReject(): boolean {
    return (
      (this.payment?.status === 'Pending' ||
        this.payment?.status === 'Under Review') &&
      (this.authService.hasRole(Role.TAX_OFFICER) ||
        this.authService.hasRole(Role.SUPERVISOR) ||
        this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN))
    );
  }

  canCancel(): boolean {
    return (
      this.payment?.status === 'Failed' &&
      (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN))
    );
  }

  canEdit(): boolean {
    return (
      !!this.payment &&
      this.payment.status !== 'Completed' &&
      this.payment.status !== 'Cancelled'
    );
  }

  hasAnyWorkflowAction(): boolean {
    return (
      this.canMarkUnderReview() ||
      this.canApprove() ||
      this.canReject() ||
      this.canCancel()
    );
  }

  // ── Modal ───────────────────────────────────────────────────────────────────

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
    if (!this.payment) return;

    // Remarks mandatory for Reject / Cancel
    if (
      (this.currentAction === 'Reject' || this.currentAction === 'Cancel') &&
      !this.actionRemarks.trim()
    ) {
      this.actionError = 'Remarks are required for this action.';
      return;
    }

    const statusMap: Record<string, string> = {
      'Mark Under Review': 'Under Review',
      Approve: 'Completed',
      Reject: 'Failed',
      Cancel: 'Cancelled',
    };

    const newStatus = statusMap[this.currentAction];
    const payload = { status: newStatus, remarks: this.actionRemarks.trim() };

    this.isActing = true;
    this.actionError = '';

    this.http
      .patch(API_ENDPOINTS.PAYMENTS.UPDATE_STATUS(this.payment.id), payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isActing = false)),
      )
      .subscribe({
        next: () => {
          this.payment!.status = newStatus as any;
          if (this.actionRemarks.trim())
            this.payment!.remarks = this.actionRemarks.trim();
          this.toast.success(`Payment ${this.currentAction}d successfully!`);
          this.closeModal();
        },
        error: (err) => {
          this.actionError =
            err?.error?.message || 'Action failed. Please try again.';
        },
      });
  }

  // ── Modal Display Helpers ───────────────────────────────────────────────────

  getModalConfig(): {
    title: string;
    sub: string;
    icon: string;
    headerClass: string;
    btnClass: string;
  } {
    const map: Record<string, any> = {
      'Mark Under Review': {
        title: 'Start Review',
        sub: 'Move payment to officer review queue',
        icon: 'bi bi-search',
        headerClass: 'am-start-review',
        btnClass: 'am-confirm-start-review',
      },
      Approve: {
        title: 'Approve Payment',
        sub: 'Confirm payment and mark as Completed',
        icon: 'bi bi-check-circle-fill',
        headerClass: 'am-accept',
        btnClass: 'am-confirm-accept',
      },
      Reject: {
        title: 'Reject Payment',
        sub: 'Mark payment as Failed (remarks required)',
        icon: 'bi bi-x-circle-fill',
        headerClass: 'am-reject',
        btnClass: 'am-confirm-reject',
      },
      Cancel: {
        title: 'Cancel Payment',
        sub: 'Permanently cancel this payment (remarks required)',
        icon: 'bi bi-slash-circle-fill',
        headerClass: 'am-reject',
        btnClass: 'am-confirm-reject',
      },
    };
    return (
      map[this.currentAction] ?? {
        title: this.currentAction,
        sub: '',
        icon: 'bi bi-circle',
        headerClass: '',
        btnClass: '',
      }
    );
  }

  remarksRequired(): boolean {
    return this.currentAction === 'Reject' || this.currentAction === 'Cancel';
  }

  // ── UI Helpers ──────────────────────────────────────────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Completed: 'status-active',
      Pending: 'status-pending',
      'Under Review': 'status-review',
      Failed: 'status-suspended',
      Cancelled: 'status-inactive',
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      VAT: 'type-vat',
      'Income Tax': 'type-it',
      Penalty: 'type-penalty',
      Refund: 'type-refund',
      Other: 'type-other',
    };
    return map[type] ?? 'type-other';
  }

  formatCurrency(amount: number): string {
    if (!amount) return '৳0';
    if (amount >= 10_000_000) return `৳${(amount / 10_000_000).toFixed(2)} Cr`;
    if (amount >= 100_000) return `৳${(amount / 100_000).toFixed(2)}L`;
    return `৳${amount.toLocaleString('en-BD')}`;
  }

  formatTimestamp(ts: string): string {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('en-BD', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  // ───────────────────── Navigation ────────────────────────

  onEdit(): void {
    if (this.payment?.id) {
      this.router.navigate(['../../edit', this.payment.id], {
        relativeTo: this.route,
      });
    }
  }

  onBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['../..'], {
        relativeTo: this.route,
      });
    }
  }
}
