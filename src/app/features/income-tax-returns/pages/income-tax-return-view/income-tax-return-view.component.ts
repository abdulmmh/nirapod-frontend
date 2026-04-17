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
  styleUrls: ['./income-tax-return-view.component.css']
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

  private destroy$ = new Subject<void>();

  // ✅ Status Mapping (Single Source of Truth)
  statusMap: Record<string, string> = {
    'Submit': 'Submitted',
    'Start Review': 'Under Review',
    'Accept': 'Accepted',
    'Reject': 'Rejected',
    'Send Back': 'Send Back'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private toast: ToastService
  ) {}

  // ───────────── Lifecycle ─────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────── Data Load ─────────────

  private loadData(id: number): void {
    this.isLoading = true;

    this.http.get<IncomeTaxReturn>(API_ENDPOINTS.INCOME_TAX_RETURNS.GET(id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.itr = data;
        },
        error: () => {
          this.toast.error('Failed to load income tax return.');
          this.router.navigate(['/income-tax-returns']);
        }
      });
  }

  // ───────────── Workflow Permissions ─────────────

  canSubmit(): boolean {
    return this.itr?.status === 'Draft' || this.itr?.status === 'Send Back';
  }

  canStartReview(): boolean {
    return this.itr?.status === 'Submitted' &&
           this.authService.hasRole(Role.TAX_OFFICER);
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

  // ───────────── Modal Control ─────────────

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

  // ───────────── Action Handler  ─────────────

  confirmAction(): void {
    if (!this.itr || !this.currentAction) return;

    // Validation
    if (
      (this.currentAction === 'Reject' || this.currentAction === 'Send Back') &&
      !this.actionRemarks.trim()
    ) {
      this.actionError = 'Remarks are required for this action.';
      return;
    }

    const newStatus = this.statusMap[this.currentAction];

    const payload = {
      status: newStatus,
      remarks: this.actionRemarks,
      action: this.currentAction,

      // ✅ Dynamic Auth Info
      performedBy: this.authService.currentUser?.email ?? 'unknown',
      role: this.authService.userRole ?? 'UNKNOWN'
    };

    this.isActing = true;
    this.actionError = '';

    this.http.patch<IncomeTaxReturn>(
      API_ENDPOINTS.INCOME_TAX_RETURNS.UPDATE_STATUS(this.itr.id),
      payload
    )
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.isActing = false))
    )
    .subscribe({
      next: (updatedData) => {
        // ✅ Backend is source of truth
        this.itr = updatedData;

        this.toast.success(`Return ${this.currentAction}ed successfully!`);
        this.closeModal();
      },
      error: (err) => {
        this.toast.error(
          err?.error?.message || 'Failed to update status. Please try again.'
        );
      }
    });
  }

  // ───────────── UI Helpers ─────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft',
      'Submitted': 'status-pending',
      'Under Review': 'status-review',
      'Accepted': 'status-active',
      'Rejected': 'status-suspended',
      'Overdue': 'status-overdue',
      'Amended': 'status-amended',
      'Send Back': 'status-sendback'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Individual': 'cat-individual',
      'Company': 'cat-company',
      'Partnership': 'cat-partner',
      'NGO': 'cat-ngo'
    };
    return map[c] ?? '';
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'Return Filed': 'bi bi-send-fill',
      'Return Submitted': 'bi bi-send-fill',
      'Review Started': 'bi bi-search',
      'Return Accepted': 'bi bi-check-circle-fill',
      'Return Rejected': 'bi bi-x-circle-fill',
      'Sent Back for Correction': 'bi bi-arrow-return-left'
    };
    return map[action] ?? 'bi bi-circle-fill';
  }

  getActionColor(toStatus: string): string {
    const map: Record<string, string> = {
      'Submitted': 'tl-blue',
      'Under Review': 'tl-purple',
      'Accepted': 'tl-green',
      'Rejected': 'tl-red',
      'Send Back': 'tl-orange'
    };
    return map[toStatus] ?? 'tl-gray';
  }

  fmt(a: number): string {
    return `৳${a.toLocaleString()}`;
  }

  // ───────────── Navigation ─────────────

  onEdit(): void {
    this.router.navigate(['/income-tax-returns/edit', this.itr?.id]);
  }

  onBack(): void {
    this.router.navigate(['/income-tax-returns']);
  }
}