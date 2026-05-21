// audit-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../../service/audit.service';
import { AuditCase } from '../../../../models/audit.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss']
})
export class AuditListComponent implements OnInit {

  cases: AuditCase[]        = [];
  kpis: { [key: string]: number } | null = null;
  isLoading                 = false;
  searchTerm                = '';
  showDeleteModal           = false;
  pendingDeleteId: number | null = null;

  // Pagination
  currentPage  = 0;
  pageSize     = 20;
  totalElements = 0;
  totalPages   = 0;
  pageNumbers: number[] = [];

  // Filters
  filters = { status: '', auditType: '', fiscalYear: '', priority: '' };

  private searchSubject = new Subject<string>();

  readonly Math = Math;

  readonly statuses = [
    { value: 'SELECTED',            label: 'Selected' },
    { value: 'CASE_CREATED',        label: 'Case Created' },
    { value: 'NOTICE_ISSUED',       label: 'Notice Issued' },
    { value: 'UNDER_REVIEW',        label: 'Under Review' },
    { value: 'DOCUMENT_REQUESTED',  label: 'Document Requested' },
    { value: 'RESPONSE_RECEIVED',   label: 'Response Received' },
    { value: 'FINDINGS_RECORDED',   label: 'Findings Recorded' },
    { value: 'ASSESSMENT_PROPOSED', label: 'Assessment Proposed' },
    { value: 'SUPERVISOR_REVIEW',   label: 'Supervisor Review' },
    { value: 'ASSESSMENT_APPROVED', label: 'Assessment Approved' },
    { value: 'DEMAND_ISSUED',       label: 'Demand Issued' },
    { value: 'PAID',                label: 'Paid' },
    { value: 'PARTIALLY_PAID',      label: 'Partially Paid' },
    { value: 'APPEALED',            label: 'Appealed' },
    { value: 'CLOSED',              label: 'Closed' },
    { value: 'CANCELLED',           label: 'Cancelled' },
  ];

  readonly auditTypes = [
    { value: 'DESK',          label: 'Desk Audit' },
    { value: 'FIELD',         label: 'Field Audit' },
    { value: 'COMPREHENSIVE', label: 'Comprehensive' },
    { value: 'VAT',           label: 'VAT Audit' },
    { value: 'REFUND',        label: 'Refund Audit' },
    { value: 'SPECIAL',       label: 'Special Investigation' },
  ];

  readonly fiscalYears = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

  constructor(private auditService: AuditService, private router: Router) {}

  ngOnInit(): void {
    this.loadCases();
    this.loadKpis();

    this.searchSubject.pipe(debounceTime(350)).subscribe(q => {
      if (q.trim().length > 1) {
        this.auditService.searchCases(q).subscribe({
          next: results => { this.cases = results; this.totalElements = results.length; },
          error: () => {}
        });
      } else {
        this.loadCases();
      }
    });
  }

  loadCases(): void {
    this.isLoading = true;
    this.auditService.getCases(
      this.filters.status   || undefined,
      this.filters.auditType || undefined,
      this.filters.fiscalYear || undefined,
      this.filters.priority  || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: page => {
        this.cases         = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.pageNumbers   = Array.from({ length: this.totalPages }, (_, i) => i);
        this.isLoading     = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadKpis(): void {
    this.auditService.getKpis().subscribe({
      next: k => this.kpis = k,
      error: () => {}
    });
  }

  onSearch(): void { this.searchSubject.next(this.searchTerm); }

  clearFilters(): void {
    this.filters    = { status: '', auditType: '', fiscalYear: '', priority: '' };
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadCases();
  }

  view(id: number): void { this.router.navigate(['/audits', id]); }
  edit(id: number): void { this.router.navigate(['/audits', id, 'edit']); }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void { this.showDeleteModal = false; this.pendingDeleteId = null; }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.auditService.deleteCase(this.pendingDeleteId).subscribe({
      next: () => { this.showDeleteModal = false; this.pendingDeleteId = null; this.loadCases(); },
      error: () => { this.showDeleteModal = false; }
    });
  }

  exportCsv(): void {
    const header = ['Case No','Taxpayer','TIN','Type','Tax Type','Year','Priority','Status','Due Date'];
    const rows   = this.cases.map(c => [
      c.caseNo, c.taxpayerName, c.tinNumber, c.auditType,
      c.taxType, c.fiscalYear, c.priority, c.status, c.dueDate
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = 'audit-cases.csv'; a.click(); URL.revokeObjectURL(url);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  prevPage(): void { if (this.currentPage > 0) { this.currentPage--; this.loadCases(); } }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.loadCases(); } }
  goToPage(p: number): void { this.currentPage = p; this.loadCases(); }

  // ── Helpers ────────────────────────────────────────────────────────────────
  isDue(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      SELECTED:            'badge-secondary',
      CASE_CREATED:        'badge-info',
      NOTICE_ISSUED:       'badge-warning',
      UNDER_REVIEW:        'badge-primary',
      DOCUMENT_REQUESTED:  'badge-orange',
      RESPONSE_RECEIVED:   'badge-teal',
      FINDINGS_RECORDED:   'badge-purple',
      ASSESSMENT_PROPOSED: 'badge-indigo',
      SUPERVISOR_REVIEW:   'badge-yellow',
      ASSESSMENT_APPROVED: 'badge-success',
      DEMAND_ISSUED:       'badge-danger',
      PAID:                'badge-green',
      PARTIALLY_PAID:      'badge-lime',
      APPEALED:            'badge-pink',
      CLOSED:              'badge-dark',
      CANCELLED:           'badge-muted',
    };
    return map[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string {
    return this.statuses.find(x => x.value === s)?.label ?? s;
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      DESK: 'type-desk', FIELD: 'type-field', COMPREHENSIVE: 'type-comp',
      VAT: 'type-vat', REFUND: 'type-refund', SPECIAL: 'type-special'
    };
    return map[t] ?? '';
  }

  getTypeLabel(t: string): string {
    return this.auditTypes.find(x => x.value === t)?.label ?? t;
  }

  getTaxTypeLabel(t: string): string {
    const map: Record<string, string> = {
      INCOME_TAX: 'Income Tax', VAT: 'VAT', AIT: 'AIT'
    };
    return map[t] ?? t;
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      LOW: 'pri-low', NORMAL: 'pri-normal', HIGH: 'pri-high', CRITICAL: 'pri-critical'
    };
    return map[p] ?? '';
  }
}
