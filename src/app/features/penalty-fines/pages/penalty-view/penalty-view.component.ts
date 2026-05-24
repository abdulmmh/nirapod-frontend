import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { PenaltyService } from '../../services/penalty.service';

@Component({
  selector: 'app-penalty-view',
  templateUrl: './penalty-view.component.html',
  styleUrls: ['./penalty-view.component.css'],
})
export class PenaltyViewComponent implements OnInit {
  penalty: Penalty | null = null;
  isLoading = true;
  showActionModal = false;
  pendingAction = '';
  actionRemarks = '';
  isActing = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private penaltyService: PenaltyService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.penaltyService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.penalty = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load penalty.');
        },
      });
  }

  get role(): string {
    return this.authService.userRole;
  }
  get isApprover(): boolean {
    return ['SUPER_ADMIN', 'TAX_COMMISSIONER'].includes(this.role);
  }
  get isOfficer(): boolean {
    return ['SUPER_ADMIN', 'TAX_COMMISSIONER', 'TAX_OFFICER'].includes(
      this.role,
    );
  }

  canSubmit(): boolean {
    return this.penalty?.status === 'DRAFT' && this.isOfficer;
  }
  canApprove(): boolean {
    return this.penalty?.status === 'PENDING_APPROVAL' && this.isApprover;
  }
  canReject(): boolean {
    return this.penalty?.status === 'PENDING_APPROVAL' && this.isApprover;
  }
  canIssue(): boolean {
    return this.penalty?.status === 'APPROVED' && this.isApprover;
  }
  canEdit(): boolean {
    return this.penalty?.status === 'DRAFT' && this.isOfficer;
  }
  canCancel(): boolean {
    const terminal = ['PAID', 'CLOSED', 'CANCELLED'];
    return !terminal.includes(this.penalty?.status ?? '') && this.isApprover;
  }

  // ── Actions ────────────────────────────────────────────────────
  openAction(action: string): void {
    this.pendingAction = action;
    this.actionRemarks = '';
    this.showActionModal = true;
  }

  closeAction(): void {
    this.showActionModal = false;
    this.pendingAction = '';
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ');
  }

  confirmAction(): void {
    if (!this.penalty) return;
    this.isActing = true;
    const req = { remarks: this.actionRemarks };
    const id = this.penalty.id;

    const call$ =
      this.pendingAction === 'submit'
        ? this.penaltyService.submit(id, req)
        : this.pendingAction === 'approve'
          ? this.penaltyService.approve(id, req)
          : this.pendingAction === 'reject'
            ? this.penaltyService.reject(id, req)
            : this.pendingAction === 'issue'
              ? this.penaltyService.issue(id, req)
              : this.penaltyService.cancel(id, req);

    call$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.penalty = updated;
        this.isActing = false;
        this.closeAction();
        this.toast.success(`Penalty ${this.pendingAction}d successfully.`);
      },
      error: (err) => {
        this.isActing = false;
        this.toast.error(err?.error?.message || 'Action failed.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      DRAFT: 'status-draft',
      PENDING_APPROVAL: 'status-pending',
      APPROVED: 'status-approved',
      ISSUED: 'status-issued',
      PARTIALLY_PAID: 'status-partial',
      PAID: 'status-active',
      APPEALED: 'status-appealed',
      CANCELLED: 'status-cancelled',
      CLOSED: 'status-closed',
      Issued: 'status-issued',
      Paid: 'status-active',
      Overdue: 'status-overdue',
    };
    return map[s] ?? '';
  }

  getSeverityClass(s: string): string {
    const map: Record<string, string> = {
      Low: 'sev-low',
      Medium: 'sev-medium',
      High: 'sev-high',
      Critical: 'sev-critical',
    };
    return map[s] ?? '';
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      submit: 'Submit for Approval',
      approve: 'Approve',
      reject: 'Reject',
      issue: 'Issue Officially',
      cancel: 'Cancel',
    };
    return map[action] ?? action;
  }

  getActionClass(action: string): string {
    if (action === 'approve' || action === 'issue')
      return 'btn-modal-confirm success';
    if (action === 'cancel' || action === 'reject')
      return 'btn-modal-confirm error';
    return 'btn-modal-confirm';
  }

  fmt(amount: number | null | undefined): string {
    if (!amount) return '৳0';
    return `৳${amount.toLocaleString()}`;
  }

  onEdit(): void {
    this.router.navigate(['/penalties', 'edit', this.penalty?.id]);
  }
  onBack(): void {
    this.router.navigate(['/penalties']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
