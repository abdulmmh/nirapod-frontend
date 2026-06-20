// audit-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../../service/audit.service';
import { AuditCase } from '../../../../models/audit.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.css'],
})
export class AuditListComponent implements OnInit {
  cases: AuditCase[] = [];
  kpis: { [key: string]: number } | null = null;
  isLoading = false;
  searchTerm = '';
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  pageNumbers: number[] = [];

  // Filters
  filters = { status: '', auditType: '', fiscalYear: '', priority: '' };

  // ── KPI quick-filter ──────────────────────────────────────────────────────
  //
  // KPI cards are a client-side "quick view" layered on top of the server-
  // paginated `cases` list — same pattern Jira/ServiceNow use for dashboard
  // widgets. Clicking a card does NOT touch the `status` dropdown or trigger
  // a new server page; it filters the currently-loaded page's cases by a
  // status GROUP (since "Open Audits" maps to many individual enum values,
  // not one). Clearing the KPI filter restores the normal paginated view.
  //
  // This keeps the existing server-side dropdown filter untouched and avoids
  // the ambiguity of cramming a multi-status group into a single-value param.
  activeKpiGroup: string | null = null;

  readonly kpiStatusGroups: Record<string, string[]> = {
    openAudits: [
      'SELECTED', 'CASE_CREATED', 'NOTICE_ISSUED', 'UNDER_REVIEW',
      'DOCUMENT_REQUESTED', 'RESPONSE_RECEIVED', 'FINDINGS_RECORDED',
      'ASSESSMENT_PROPOSED', 'SUPERVISOR_REVIEW',
    ],
    assessmentApproved: ['ASSESSMENT_APPROVED'],
    demandIssued: ['DEMAND_ISSUED'],
    paid: ['PAID', 'PARTIALLY_PAID'],
    appealed: ['APPEALED'],
  };

  private searchSubject = new Subject<string>();

  readonly Math = Math;

  readonly statuses = [
    { value: 'SELECTED', label: 'Selected' },
    { value: 'CASE_CREATED', label: 'Case Created' },
    { value: 'NOTICE_ISSUED', label: 'Notice Issued' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'DOCUMENT_REQUESTED', label: 'Document Requested' },
    { value: 'RESPONSE_RECEIVED', label: 'Response Received' },
    { value: 'FINDINGS_RECORDED', label: 'Findings Recorded' },
    { value: 'ASSESSMENT_PROPOSED', label: 'Assessment Proposed' },
    { value: 'SUPERVISOR_REVIEW', label: 'Supervisor Review' },
    { value: 'ASSESSMENT_APPROVED', label: 'Assessment Approved' },
    { value: 'DEMAND_ISSUED', label: 'Demand Issued' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
    { value: 'APPEALED', label: 'Appealed' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly auditTypes = [
    { value: 'DESK', label: 'Desk Audit' },
    { value: 'FIELD', label: 'Field Audit' },
    { value: 'COMPREHENSIVE', label: 'Comprehensive' },
    { value: 'VAT', label: 'VAT Audit' },
    { value: 'REFUND', label: 'Refund Audit' },
    { value: 'SPECIAL', label: 'Special Investigation' },
  ];

  readonly fiscalYears = [
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
  ];

  constructor(
    private auditService: AuditService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCases();
    this.loadKpis();

    this.searchSubject.pipe(debounceTime(350)).subscribe((q) => {
      if (q.trim().length > 1) {
        this.auditService.searchCases(q).subscribe({
          next: (results) => {
            this.cases = results;
            this.totalElements = results.length;
          },
          error: () => {},
        });
      } else {
        this.loadCases();
      }
    });
  }

  loadCases(): void {
    this.isLoading = true;
    this.auditService
      .getCases(
        this.filters.status || undefined,
        this.filters.auditType || undefined,
        this.filters.fiscalYear || undefined,
        this.filters.priority || undefined,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (page) => {
          this.cases = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.pageNumbers = Array.from(
            { length: this.totalPages },
            (_, i) => i,
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  /** Dropdown filters changed — reset to page 0 before reloading, otherwise
   *  a narrower result set can leave the user stranded on an empty page. */
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadCases();
  }

  loadKpis(): void {
    this.auditService.getKpis().subscribe({
      next: (k) => (this.kpis = k),
      error: () => {},
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // ── KPI quick-filter ──────────────────────────────────────────────────────

  /** Toggles a KPI card's status-group filter over the currently loaded page. */
  onKpiCardClick(kpiKey: string): void {
    this.activeKpiGroup = this.activeKpiGroup === kpiKey ? null : kpiKey;
  }

  isKpiActive(kpiKey: string): boolean {
    return this.activeKpiGroup === kpiKey;
  }

  /** Human-readable label for the currently active KPI quick-filter banner. */
  get activeKpiLabel(): string {
    const labels: Record<string, string> = {
      openAudits: 'Open Audits',
      assessmentApproved: 'Approved',
      demandIssued: 'Demand Issued',
      paid: 'Paid',
      appealed: 'Appealed',
    };
    return this.activeKpiGroup ? (labels[this.activeKpiGroup] ?? this.activeKpiGroup) : '';
  }

  /** Cases shown in the table — narrowed by the active KPI group, if any. */
  get visibleCases(): AuditCase[] {
    if (!this.activeKpiGroup) return this.cases;
    const group = this.kpiStatusGroups[this.activeKpiGroup] ?? [];
    return this.cases.filter((c) => group.includes(c.status));
  }

  clearKpiFilter(): void {
    this.activeKpiGroup = null;
  }

  clearFilters(): void {
    this.filters = { status: '', auditType: '', fiscalYear: '', priority: '' };
    this.searchTerm = '';
    this.currentPage = 0;
    this.activeKpiGroup = null;
    Object.keys(this.filters).forEach((k) => ((this.filters as any)[k] = ''));
    this.loadCases();
  }

  view(id: number): void {
    this.router.navigate(['/audits', id]);
  }
  edit(id: number): void {
    this.router.navigate(['/audits', id, 'edit']);
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.pendingDeleteId = null;
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.auditService.deleteCase(this.pendingDeleteId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.pendingDeleteId = null;
        this.loadCases();
      },
      error: () => {
        this.showDeleteModal = false;
      },
    });
  }

  exportCsv(): void {
    const header = [
      'Case No',
      'Taxpayer',
      'TIN',
      'Type',
      'Tax Type',
      'Year',
      'Priority',
      'Status',
      'Due Date',
    ];
    const rows = this.cases.map((c) => [
      c.caseNo,
      c.taxpayerName,
      c.tinNumber,
      c.auditType,
      c.taxType,
      c.fiscalYear,
      c.priority,
      c.status,
      c.dueDate,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-cases.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCases();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCases();
    }
  }
  goToPage(p: number): void {
    this.currentPage = p;
    this.loadCases();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  isDue(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      SELECTED: 'badge-secondary',
      CASE_CREATED: 'badge-info',
      NOTICE_ISSUED: 'badge-warning',
      UNDER_REVIEW: 'badge-primary',
      DOCUMENT_REQUESTED: 'badge-orange',
      RESPONSE_RECEIVED: 'badge-teal',
      FINDINGS_RECORDED: 'badge-purple',
      ASSESSMENT_PROPOSED: 'badge-indigo',
      SUPERVISOR_REVIEW: 'badge-yellow',
      ASSESSMENT_APPROVED: 'badge-success',
      DEMAND_ISSUED: 'badge-danger',
      PAID: 'badge-green',
      PARTIALLY_PAID: 'badge-lime',
      APPEALED: 'badge-pink',
      CLOSED: 'badge-dark',
      CANCELLED: 'badge-muted',
    };
    return map[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string {
    return this.statuses.find((x) => x.value === s)?.label ?? s;
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      DESK: 'type-desk',
      FIELD: 'type-field',
      COMPREHENSIVE: 'type-comp',
      VAT: 'type-vat',
      REFUND: 'type-refund',
      SPECIAL: 'type-special',
    };
    return map[t] ?? '';
  }

  getTypeLabel(t: string): string {
    return this.auditTypes.find((x) => x.value === t)?.label ?? t;
  }

  getTaxTypeLabel(t: string): string {
    const map: Record<string, string> = {
      INCOME_TAX: 'Income Tax',
      VAT: 'VAT',
      AIT: 'AIT',
    };
    return map[t] ?? t;
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      LOW: 'pri-low',
      NORMAL: 'pri-normal',
      HIGH: 'pri-high',
      CRITICAL: 'pri-critical',
    };
    return map[p] ?? '';
  }
}