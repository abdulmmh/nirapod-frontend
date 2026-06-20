import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RefundService } from '../../services/refund.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { RefundFilterRequest, RefundSummary } from '../../../../models/refund.model';
import { FiscalYear } from 'src/app/models/fiscal-year.model';
import { Role } from 'src/app/core/constants/roles.constants';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css'],
})
export class RefundListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  refunds: RefundSummary[] = [];
  loading      = false;
  errorMessage = '';

  // Pagination
  currentPage   = 0;
  pageSize      = 10;
  totalElements = 0;
  totalPages    = 0;

  // Filters
  searchTerm        = '';
  selectedStatus    = '';
  selectedType      = '';
  selectedFiscalYear: number | '' = '';

  // KPI stats
  totalApproved = 0;
  totalPaid     = 0;

  // Fiscal years dropdown
  fiscalYears: FiscalYear[] = [];

  // FIX: track whether this user is an officer/admin so we call the right endpoint
  isOfficerRole = false;

  readonly statuses = [
    { value: 'DRAFT',              label: 'Draft'              },
    { value: 'SUBMITTED',          label: 'Submitted'          },
    { value: 'UNDER_VERIFICATION', label: 'Under Verification' },
    { value: 'INFO_REQUESTED',     label: 'Info Requested'     },
    { value: 'RESPONSE_RECEIVED',  label: 'Response Received'  },
    { value: 'RECOMMENDED',        label: 'Recommended'        },
    { value: 'SUPERVISOR_REVIEW',  label: 'Supervisor Review'  },
    { value: 'APPROVED',           label: 'Approved'           },
    { value: 'REJECTED',           label: 'Rejected'           },
    { value: 'PAYMENT_PENDING',    label: 'Payment Pending'    },
    { value: 'PAYMENT_PROCESSING', label: 'Payment Processing' },
    { value: 'PAID',               label: 'Paid'               },
    { value: 'FAILED',             label: 'Failed'             },
    { value: 'CANCELLED',          label: 'Cancelled'          },
    { value: 'CLOSED',             label: 'Closed'             },
  ];

  readonly refundTypes = [
    { value: 'INCOME_TAX',        label: 'Income Tax'        },
    { value: 'VAT',               label: 'VAT'               },
    { value: 'AIT',               label: 'AIT'               },
    { value: 'DUPLICATE_PAYMENT', label: 'Duplicate Payment' },
    { value: 'APPEAL_DECISION',   label: 'Appeal Decision'   },
    { value: 'OTHER',             label: 'Other'             },
  ];

  readonly refundTypeLabels: Record<string, string> = {
    INCOME_TAX:        'Income Tax',
    VAT:               'VAT',
    AIT:               'AIT',
    DUPLICATE_PAYMENT: 'Duplicate Payment',
    APPEAL_DECISION:   'Appeal Decision',
    OTHER:             'Other',
  };

  constructor(
    private refundService: RefundService,
    private authService: AuthService,
    private masterDataService: MasterDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // FIX: determine role once on init so loadRefunds() uses the right endpoint
    const role = this.authService.userRole;
    this.isOfficerRole = role !== Role.TAXPAYER && role !== Role.GUEST;

    this.loadFiscalYears();
    this.loadRefunds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ────────────────────────────────────────────

  loadFiscalYears(): void {
    this.masterDataService.getFiscalYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (fy) => this.fiscalYears = fy, error: () => {} });
  }

  loadRefunds(): void {
    this.loading      = true;
    this.errorMessage = '';

    if (this.isOfficerRole) {
      // FIX: Officers and admins call GET /api/refunds (all refunds) not /api/refunds/my
      // SUPER_ADMIN has no taxpayer record so getMyRefunds() always returns empty.
      this.refundService.getAllRefunds()
        .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
        .subscribe({
          next: (refunds) => {
            // Apply client-side filters (replace with server-side query params if needed)
            let filtered = refunds;
            if (this.selectedStatus)
              filtered = filtered.filter(r => r.status === this.selectedStatus);
            if (this.selectedType)
              filtered = filtered.filter(r => r.refundType === this.selectedType);
            if (this.searchTerm) {
              const q = this.searchTerm.toLowerCase();
              filtered = filtered.filter(r =>
                r.refundReferenceNo?.toLowerCase().includes(q) ||
                r.tin?.toLowerCase().includes(q) ||
                r.taxpayerName?.toLowerCase().includes(q),
              );
            }

            // Manual pagination
            this.totalElements = filtered.length;
            this.totalPages    = Math.ceil(filtered.length / this.pageSize);
            const from = this.currentPage * this.pageSize;
            this.refunds = filtered.slice(from, from + this.pageSize);
            this.calculateStats(filtered);
          },
          error: () => { this.errorMessage = 'Failed to load refund applications.'; },
        });
    } else {
      // Taxpayer: only see their own refunds (paginated by backend)
      const req: RefundFilterRequest = {
        page:         this.currentPage,
        size:         this.pageSize,
        sortBy:       'submittedAt',
        sortDir:      'DESC',
        status:       this.selectedStatus      || undefined,
        refundType:   this.selectedType        || undefined,
        fiscalYearId: this.selectedFiscalYear  || undefined,
      };

      this.refundService.getMyRefunds(req)
        .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
        .subscribe({
          next: (res) => {
            this.refunds       = res.content;
            this.totalElements = res.totalElements;
            this.totalPages    = res.totalPages;
            this.calculateStats(res.content);
          },
          error: () => { this.errorMessage = 'Failed to load refund applications.'; },
        });
    }
  }

  calculateStats(refunds: RefundSummary[] = this.refunds): void {
    this.totalApproved = refunds
      .filter(r => ['APPROVED','PAYMENT_PENDING','PAYMENT_PROCESSING','PAID','CLOSED']
        .includes(r.status))
      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);

    this.totalPaid = refunds
      .filter(r => r.status === 'PAID' || r.status === 'CLOSED')
      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);
  }

  countByStatus(status: string): number {
    return this.refunds.filter(r => r.status === status).length;
  }

  // ── Filters ─────────────────────────────────────────────────

  applyFilters(): void { this.currentPage = 0; this.loadRefunds(); }

  clearFilters(): void {
    this.searchTerm         = '';
    this.selectedStatus     = '';
    this.selectedType       = '';
    this.selectedFiscalYear = '';
    this.currentPage        = 0;
    this.loadRefunds();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadRefunds();
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(0, cur - 2);
    const end   = Math.min(total - 1, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ── Permissions ─────────────────────────────────────────────

  canEdit(r: RefundSummary):    boolean { return r.status === 'DRAFT'; }
  canCancel(r: RefundSummary):  boolean { return ['DRAFT','SUBMITTED'].includes(r.status); }
  canRespond(r: RefundSummary): boolean { return r.status === 'INFO_REQUESTED'; }

  // ── Navigation ──────────────────────────────────────────────

  navigateToCreate():            void { this.router.navigate(['/refunds/create']); }
  navigateToView(id: number):    void { this.router.navigate(['/refunds', id, 'view']); }
  navigateToEdit(id: number):    void { this.router.navigate(['/refunds', id, 'edit']); }
  navigateToRespond(id: number): void { this.router.navigate(['/refunds', id, 'respond']); }

  cancelRefund(id: number): void {
    if (!confirm('Cancel this refund application?')) return;
    this.refundService.cancel(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadRefunds(), error: () => alert('Failed to cancel.') });
  }

  // ── UI helpers ───────────────────────────────────────────────

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      INCOME_TAX:        'type-income-tax',
      VAT:               'type-vat',
      AIT:               'type-ait',
      DUPLICATE_PAYMENT: 'type-duplicate',
      APPEAL_DECISION:   'type-appeal',
      OTHER:             'type-other',
    };
    return map[type] ?? 'type-other';
  }

  // ── Missing methods referenced by HTML template ───────────────

  /** Returns the fiscal year ID regardless of shape (id or fyId field) */
  getFyId(fy: any): number {
    return fy?.id ?? fy?.fyId ?? fy?.fiscalYearId ?? '';
  }

  /** Returns the fiscal year display name regardless of shape */
  getFyName(fy: any): string {
    return fy?.yearName ?? fy?.name ?? fy?.fiscalYearName ?? String(fy?.id ?? '');
  }

  /** Risk level string from a RefundSummary */
  getRisk(r: RefundSummary): string {
    return r?.riskLevel ?? '';
  }

  /** CSS class for risk badge */
  getRiskClass(risk: string): string {
    const map: Record<string, string> = {
      HIGH:     'risk-high',
      MEDIUM:   'risk-medium',
      LOW:      'risk-low',
      CRITICAL: 'risk-critical',
    };
    return map[(risk ?? '').toUpperCase()] ?? 'risk-low';
  }

  /** CSS class for status badge */
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT:              'status-draft',
      SUBMITTED:          'status-submitted',
      UNDER_VERIFICATION: 'status-verification',
      INFO_REQUESTED:     'status-info',
      RESPONSE_RECEIVED:  'status-response',
      RECOMMENDED:        'status-recommended',
      SUPERVISOR_REVIEW:  'status-supervisor',
      APPROVED:           'status-approved',
      REJECTED:           'status-rejected',
      PAYMENT_PENDING:    'status-payment-pending',
      PAYMENT_PROCESSING: 'status-processing',
      PAID:               'status-paid',
      FAILED:             'status-failed',
      CANCELLED:          'status-cancelled',
      CLOSED:             'status-closed',
    };
    return map[status] ?? 'status-draft';
  }

  /** Human-readable status label */
  getStatusLabel(status: string): string {
    const found = this.statuses.find(s => s.value === status);
    return found?.label ?? status ?? '—';
  }

  /** Export visible refunds to CSV */
  exportCsv(): void {
    if (!this.refunds.length) return;

    const headers = [
      'Reference No', 'TIN', 'Taxpayer', 'Type',
      'Fiscal Year', 'Claimed', 'Approved', 'Status', 'Submitted',
    ];

    const rows = this.refunds.map(r => [
      r.refundReferenceNo ?? '',
      r.tin               ?? '',
      r.taxpayerName      ?? '',
      this.refundTypeLabels[r.refundType] ?? r.refundType ?? '',
      r.fiscalYearName    ?? '',
      r.claimedRefundAmount  ?? 0,
      r.approvedRefundAmount ?? '',
      this.getStatusLabel(r.status),
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-BD') : '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `refunds-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatCurrency(v: number | null): string {
    if (v == null) return '—';
    return '৳ ' + v.toLocaleString('en-BD');
  }
}