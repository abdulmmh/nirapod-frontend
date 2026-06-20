import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { RefundService } from '../../services/refund.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Role } from 'src/app/core/constants/roles.constants';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';
import { RefundDetail, RefundStatusHistory } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-view',
  templateUrl: './refund-view.component.html',
  styleUrls: ['./refund-view.component.css'],
})
export class RefundViewComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ── Data ──────────────────────────────────────────────────────────────────
  refund: RefundDetail | null = null;
  statusHistory: RefundStatusHistory[] = [];
  offsetHistory: any[] = [];
  offsetPreview: any   = null;

  // ── UI state ──────────────────────────────────────────────────────────────
  loading         = true;
  errorMessage    = '';
  activeTab: 'details' | 'history' | 'documents' | 'offset' = 'details';

  // ── Action modals ─────────────────────────────────────────────────────────
  showActionModal   = false;
  actionType: 'APPROVE' | 'REJECT' | 'INFO_REQUEST' | 'RECOMMEND' | '' = '';
  actionRemarks     = '';
  actionVerifiedAmt: number | null = null;
  actionRejectionCode = '';
  submittingAction  = false;

  // ── Role helpers ──────────────────────────────────────────────────────────
  userRole = '';
  readonly Role = Role;

  readonly rejectionCodes = [
    { value: 'INSUFFICIENT_EVIDENCE',   label: 'Insufficient Evidence'      },
    { value: 'AMOUNT_NOT_ELIGIBLE',     label: 'Amount Not Eligible'        },
    { value: 'DUPLICATE_CLAIM',         label: 'Duplicate Claim'            },
    { value: 'OUTSTANDING_LIABILITY',   label: 'Outstanding Liability'      },
    { value: 'INVALID_BANK_DETAILS',    label: 'Invalid Bank Details'       },
    { value: 'FRAUDULENT_CLAIM',        label: 'Fraudulent / False Claim'   },
    { value: 'OTHER',                   label: 'Other (specify in remarks)' },
  ];

  constructor(
    private route:         ActivatedRoute,
    private router:        Router,
    private refundService: RefundService,
    private authService:   AuthService,
    private toast:         ToastService,
    private http:          HttpClient,
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.userRole;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/refunds']);
      return;
    }
    this.loadRefund(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadRefund(id: number): void {
    this.loading      = true;
    this.errorMessage = '';

    this.refundService.getById(id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; }))
      .subscribe({
        next: (r) => {
          this.refund = r;
          this.loadStatusHistory(id);
          this.loadOffsetHistory(id);
          // Auto-load offset preview for officers
          if (this.isOfficer && r.status === 'SUPERVISOR_REVIEW') {
            this.loadOffsetPreview(id);
          }
        },
        error: () => { this.errorMessage = 'Failed to load refund details.'; },
      });
  }

  loadStatusHistory(id: number): void {
    this.refundService.getStatusHistory(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (h) => { this.statusHistory = h; }, error: () => {} });
  }

  loadOffsetHistory(id: number): void {
    this.http.get<any[]>(`${API_ENDPOINTS.REFUNDS.GET(id)}/offset-history`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (h) => { this.offsetHistory = h; }, error: () => {} });
  }

  loadOffsetPreview(id: number): void {
    this.http.get<any>(`${API_ENDPOINTS.REFUNDS.GET(id)}/offset-preview`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (p) => { this.offsetPreview = p; }, error: () => {} });
  }

  // ── Role checks ───────────────────────────────────────────────────────────

  get isOfficer(): boolean {
    return this.userRole !== Role.TAXPAYER && this.userRole !== Role.GUEST;
  }

  get isSupervisor(): boolean {
    return this.userRole === Role.TAX_COMMISSIONER ||
           this.userRole === Role.SUPER_ADMIN ||
           (this.userRole as string) === 'SUPERVISOR';
  }

  get canRecommend(): boolean {
    return this.isOfficer &&
           (this.refund?.status === 'UNDER_VERIFICATION' ||
            this.refund?.status === 'RESPONSE_RECEIVED');
  }

  get canApprove(): boolean {
    return this.isSupervisor &&
           this.refund?.status === 'SUPERVISOR_REVIEW';
  }

  get canReject(): boolean {
    return this.isOfficer &&
           !['PAID','CLOSED','CANCELLED','REJECTED'].includes(
               this.refund?.status ?? '');
  }

  get canRequestInfo(): boolean {
    return this.isOfficer &&
           (this.refund?.status === 'UNDER_VERIFICATION' ||
            this.refund?.status === 'SUBMITTED' ||
            this.refund?.status === 'RESPONSE_RECEIVED');
  }

  get canVerify(): boolean {
    return this.isOfficer &&
           this.refund?.status === 'SUBMITTED';
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  openAction(type: typeof this.actionType): void {
    this.actionType        = type;
    this.actionRemarks     = '';
    this.actionVerifiedAmt = this.refund?.approvedRefundAmount
                          ?? this.refund?.claimedRefundAmount
                          ?? null;
    this.actionRejectionCode = '';
    this.showActionModal   = true;
  }

  closeModal(): void {
    this.showActionModal = false;
    this.actionType      = '';
  }

  submitAction(): void {
    if (!this.refund) return;

    // Validate
    if ((this.actionType === 'REJECT') && !this.actionRejectionCode) {
      this.toast.error('Please select a rejection reason code.', 'Validation');
      return;
    }
    if (!this.actionRemarks.trim() &&
        (this.actionType === 'REJECT' || this.actionType === 'INFO_REQUEST')) {
      this.toast.error('Please enter remarks.', 'Validation');
      return;
    }

    this.submittingAction = true;

    const payload: any = {
      remarks:             this.actionRemarks.trim(),
      rejectionReasonCode: this.actionRejectionCode || undefined,
      verifiedAmount:      this.actionVerifiedAmt   || undefined,
      approvedAmount:      this.actionVerifiedAmt   || undefined,
    };

    // Map action to status
    const statusMap: Record<string, string> = {
      RECOMMEND:    'SUPERVISOR_REVIEW',
      APPROVE:      'APPROVED',
      REJECT:       'REJECTED',
      INFO_REQUEST: 'INFO_REQUESTED',
    };
    payload.status = statusMap[this.actionType];

    this.refundService.updateStatus(this.refund.id, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.submittingAction = false; }))
      .subscribe({
        next: (updated) => {
          this.refund = updated;
          this.closeModal();
          this.loadStatusHistory(updated.id);
          this.toast.success(
            `Refund ${payload.status.replace('_',' ').toLowerCase()} successfully.`,
            'Action Complete');
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message ?? 'Action failed. Please try again.',
            'Error');
        },
      });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  onBack(): void { this.router.navigate(['/refunds']); }
  onEdit(): void { this.router.navigate(['/refunds', this.refund?.id, 'edit']); }

  // ── UI helpers ────────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    const m: Record<string,string> = {
      DRAFT:'status-draft', SUBMITTED:'status-submitted',
      UNDER_VERIFICATION:'status-under-verification',
      INFO_REQUESTED:'status-info-requested',
      RESPONSE_RECEIVED:'status-response-received',
      RECOMMENDED:'status-recommended', SUPERVISOR_REVIEW:'status-supervisor-review',
      APPROVED:'status-approved', REJECTED:'status-rejected',
      PAYMENT_PENDING:'status-payment-pending',
      PAYMENT_PROCESSING:'status-payment-processing',
      PAID:'status-paid', FAILED:'status-failed',
      CANCELLED:'status-cancelled', CLOSED:'status-closed',
    };
    return m[s] ?? '';
  }

  getStatusLabel(s: string): string {
    return s?.replace(/_/g,' ')
             .split(' ')
             .map(w => w.charAt(0) + w.slice(1).toLowerCase())
             .join(' ') ?? s;
  }

  formatCurrency(v: number | null | undefined): string {
    if (v == null) return '—';
    if (v >= 100000) return '৳ ' + (v/100000).toFixed(2) + ' L';
    return '৳ ' + v.toLocaleString('en-BD');
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-BD', {
      day:'2-digit', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
  }

  getActionLabel(): string {
    const m: Record<string,string> = {
      RECOMMEND:    'Recommend for Approval',
      APPROVE:      'Approve Refund',
      REJECT:       'Reject Application',
      INFO_REQUEST: 'Request Information',
    };
    return m[this.actionType] ?? this.actionType;
  }

  getActionClass(): string {
    const m: Record<string,string> = {
      RECOMMEND: 'btn-recommend', APPROVE: 'btn-approve',
      REJECT: 'btn-reject',       INFO_REQUEST: 'btn-info',
    };
    return m[this.actionType] ?? 'btn-submit';
  }
}