import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import {
  RefundService
} from '../../services/refund.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { RefundFilterRequest, RefundSummary } from '../../../../models/refund.model';
import { FiscalYear } from 'src/app/models/fiscal-year.model';

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
  searchTerm       = '';
  selectedStatus   = '';
  selectedType     = '';
  selectedFiscalYear: number | '' = '';

  // KPI stats
  totalApproved = 0;
  totalPaid     = 0;

  // Fiscal years dropdown
  fiscalYears: FiscalYear[] = [];

  readonly statuses = [
    { value: 'DRAFT',              label: 'Draft'                },
    { value: 'SUBMITTED',          label: 'Submitted'            },
    { value: 'UNDER_VERIFICATION', label: 'Under Verification'   },
    { value: 'INFO_REQUESTED',     label: 'Info Requested'       },
    { value: 'RESPONSE_RECEIVED',  label: 'Response Received'    },
    { value: 'RECOMMENDED',        label: 'Recommended'          },
    { value: 'SUPERVISOR_REVIEW',  label: 'Supervisor Review'    },
    { value: 'APPROVED',           label: 'Approved'             },
    { value: 'REJECTED',           label: 'Rejected'             },
    { value: 'PAYMENT_PENDING',    label: 'Payment Pending'      },
    { value: 'PAYMENT_PROCESSING', label: 'Payment Processing'   },
    { value: 'PAID',               label: 'Paid'                 },
    { value: 'FAILED',             label: 'Failed'               },
    { value: 'CANCELLED',          label: 'Cancelled'            },
    { value: 'CLOSED',             label: 'Closed'               },
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
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

    const req: RefundFilterRequest = {
      page:        this.currentPage,
      size:        this.pageSize,
      sortBy:      'submittedAt',
      sortDir:     'DESC',
      status:      this.selectedStatus      || undefined,
      refundType:  this.selectedType        || undefined,
      fiscalYearId:this.selectedFiscalYear  || undefined,
    };

    this.refundService.getMyRefunds(req)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.refunds       = res.content;
          this.totalElements = res.totalElements;
          this.totalPages    = res.totalPages;
          this.calculateStats();
        },
        error: () => {
          this.errorMessage = 'Failed to load refund applications.';
        },
      });
  }

  calculateStats(): void {
    this.totalApproved = this.refunds
      .filter(r => ['APPROVED','PAYMENT_PENDING','PAYMENT_PROCESSING','PAID','CLOSED']
        .includes(r.status))
      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);

    this.totalPaid = this.refunds
      .filter(r => r.status === 'PAID' || r.status === 'CLOSED')
      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);
  }

  countByStatus(status: string): number {
    return this.refunds.filter(r => r.status === status).length;
  }

  // ── Filters ─────────────────────────────────────────────────

  applyFilters(): void {
    this.currentPage = 0;
    this.loadRefunds();
  }

  clearFilters(): void {
    this.searchTerm        = '';
    this.selectedStatus    = '';
    this.selectedType      = '';
    this.selectedFiscalYear = '';
    this.currentPage       = 0;
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

  getRiskClass(risk: string): string {
    const map: Record<string, string> = {
      LOW: 'risk-low', MEDIUM: 'risk-medium',
      HIGH: 'risk-high', CRITICAL: 'risk-critical',
    };
    return map[risk?.toUpperCase()] ?? 'risk-low';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT:              'status-draft',
      SUBMITTED:          'status-submitted',
      UNDER_VERIFICATION: 'status-under-verification',
      INFO_REQUESTED:     'status-info-requested',
      RESPONSE_RECEIVED:  'status-response-received',
      RECOMMENDED:        'status-recommended',
      SUPERVISOR_REVIEW:  'status-supervisor-review',
      APPROVED:           'status-approved',
      REJECTED:           'status-rejected',
      PAYMENT_PENDING:    'status-payment-pending',
      PAYMENT_PROCESSING: 'status-payment-processing',
      PAID:               'status-paid',
      FAILED:             'status-failed',
      CANCELLED:          'status-cancelled',
      CLOSED:             'status-closed',
    };
    return map[status] ?? '';
  }

  getRisk(r: RefundSummary): string {
    return r.riskLevel ?? '';
  }

  // FiscalYear field safe accessor
  getFyId(fy: FiscalYear): number {
    return (fy as any).id ?? (fy as any).fiscalYearId ?? 0;
  }

  getFyName(fy: FiscalYear): string {
    return (fy as any).name ?? (fy as any).yearName ?? '';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  formatCurrency(v: number | null | undefined): string {
    if (v == null) return '—';
    if (v >= 100000) return '৳ ' + (v / 100000).toFixed(2) + ' L';
    return '৳ ' + v.toLocaleString('en-BD');
  }

  exportCsv(): void {
    if (!this.refunds.length) return;
    const header = 'Reference No,Type,Fiscal Year,Claimed,Approved,Status,Risk,Submitted\n';
    const rows = this.refunds.map(r => [
      r.refundReferenceNo,
      this.refundTypeLabels[r.refundType] ?? r.refundType,
      r.fiscalYearName ?? '',
      r.claimedRefundAmount ?? 0,
      r.approvedRefundAmount ?? '',
      r.status,
      this.getRisk(r),
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '',
    ].join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `refunds_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }
}
