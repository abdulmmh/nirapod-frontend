import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { VatRegistration } from '../../../../models/vat-registration.model';
import { VatRegistrationService } from '../../services/vat-registration.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

type ReviewDecision = 'Approve' | 'Request' | 'Reject';

@Component({
  selector: 'app-vat-registration-view',
  templateUrl: './vat-registration-view.component.html',
  styleUrls: ['./vat-registration-view.component.css'],
})
export class VatRegistrationViewComponent implements OnInit, OnDestroy {

  vat: VatRegistration | null = null;
  isLoading = true;

  // ── Officer Review ─────────────────────────────────────────────────────────
  showReviewModal    = false;
  reviewDecision:      ReviewDecision | null = null;
  reviewRemarks      = '';
  isSubmittingReview = false;

  readonly reviewOptions: {
    key: ReviewDecision; label: string; sub: string;
    variant: 'approve' | 'request' | 'reject';
  }[] = [
    {
      key: 'Approve', label: 'Approve', variant: 'approve',
      sub: 'Registration is verified and complete. Status will be set to Active.',
    },
    {
      key: 'Request', label: 'Request More Information', variant: 'request',
      sub: 'Registration stays Pending. Use remarks to specify what is needed.',
    },
    {
      key: 'Reject', label: 'Reject', variant: 'reject',
      sub: 'Registration cannot be approved. A reason in remarks is required.',
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route:      ActivatedRoute,
    private http:      HttpClient,
    private router:     Router,
    private vatService: VatRegistrationService,
    private toast:      ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  private loadData(id: number): void {
    this.isLoading = true;
    this.vatService.getById(id)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next:  data => (this.vat = data),
        error: () => {
          this.toast.error('Failed to load VAT registration details.');
          this.router.navigate(['/vat-registration']);
        },
      });
  }

  // ── Review modal ───────────────────────────────────────────────────────────

  onOpenReview(): void {
    this.reviewDecision  = null;
    this.reviewRemarks   = this.vat?.remarks ?? '';
    this.showReviewModal = true;
  }

  onCloseReview(): void { this.showReviewModal = false; }

  selectDecision(d: ReviewDecision): void { this.reviewDecision = d; }

  get canSubmitReview(): boolean {
    if (!this.reviewDecision) return false;
    if (this.reviewDecision === 'Reject' && !this.reviewRemarks.trim()) return false;
    return true;
  }

  get reviewButtonLabel(): string {
    if (!this.reviewDecision) return 'Submit Review';
    const map: Record<ReviewDecision, string> = {
      Approve: '✓ Approve Registration',
      Request: '↩ Send Information Request',
      Reject:  '✗ Reject Registration',
    };
    return map[this.reviewDecision];
  }

  get reviewButtonClass(): string {
    if (!this.reviewDecision) return '';
    const map: Record<ReviewDecision, string> = {
      Approve: 'btn-review-approve',
      Request: 'btn-review-request',
      Reject:  'btn-review-reject',
    };
    return map[this.reviewDecision];
  }

  onSubmitReview(): void {
    if (!this.canSubmitReview || !this.vat || this.isSubmittingReview) return;

      const statusMap: Record<ReviewDecision, string> = {
        Approve: 'Active',
        Request: 'Pending',
        Reject:  'Cancelled',
      };

      // শুধু status আর remarks — বাকি কিছু না
      const payload = {
        status:  statusMap[this.reviewDecision!],
        remarks: this.reviewRemarks.trim() || '',
      };

      this.isSubmittingReview = true;
      this.http.patch<VatRegistration>(
        `${API_ENDPOINTS.VAT_REGISTRATIONS.LIST}/${this.vat.id}/status`,
        payload
      )
  .pipe(takeUntil(this.destroy$), finalize(() => (this.isSubmittingReview = false)))
  .subscribe({
    next: updated => {
      this.vat             = updated;
      this.showReviewModal = false;
      const messages: Record<ReviewDecision, string> = {
        Approve: 'Registration approved — status set to Active.',
        Request: 'Information request recorded.',
        Reject:  'Registration rejected.',
      };
      this.toast.success(messages[this.reviewDecision!]);
    },
    error: err => {
      const msg = err?.error?.message ?? 'Failed to submit review. Please try again.';
      this.toast.error(msg);
    },
  });
}

  // ── Display helpers ────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Active: 'status-active', Inactive: 'status-inactive',
      Pending: 'status-pending', Suspended: 'status-suspended', 
      Cancelled: 'status-inactive',
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Standard': 'cat-standard', 'Zero Rated': 'cat-zero',
      'Exempt': 'cat-exempt', 'Special': 'cat-special',
    };
    return map[c] ?? '';
  }

  isExpired(date: string): boolean { return !!date && new Date(date) < new Date(); }
  formatCurrency(a: number): string { return `৳${a.toLocaleString()}`; }
 
  // ───────────────────── Navigation ────────────────────────

  onEdit(): void {
    if (this.vat?.id) {
      this.router.navigate(['edit', this.vat.id], {
        relativeTo: this.route
      });
    }
  }

  onBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['../..'], {
        relativeTo: this.route
      });
    }
  }
}