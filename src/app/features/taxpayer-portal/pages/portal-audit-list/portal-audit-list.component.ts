import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../../../audit-management/service/audit.service';
import { AuditCase } from '../../../../models/audit.model';

@Component({
  selector: 'app-portal-audit-list',
  templateUrl: './portal-audit-list.component.html',
  styleUrls: ['./portal-audit-list.component.scss']
})
export class PortalAuditListComponent implements OnInit {

  cases:     AuditCase[] = [];
  isLoading  = false;

  constructor(private auditService: AuditService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.auditService.getMyAudits().subscribe({
      next: c => { this.cases = c; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  view(id: number): void { this.router.navigate(['/my-portal/audits', id]); }

  requiresAction(c: AuditCase): boolean {
    return ['DOCUMENT_REQUESTED', 'NOTICE_ISSUED'].includes(c.status)
      || c.openQueryCount > 0;
  }

  getActionRequired(c: AuditCase): string {
    if (c.status === 'DOCUMENT_REQUESTED') return 'Upload Documents';
    if (c.openQueryCount > 0) return `${c.openQueryCount} query pending`;
    if (c.status === 'NOTICE_ISSUED') return 'Notice Received';
    return '';
  }

  isDue(d: string): boolean { return !!d && new Date(d) < new Date(); }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      CASE_CREATED: 'badge-info', NOTICE_ISSUED: 'badge-warning',
      UNDER_REVIEW: 'badge-primary', DOCUMENT_REQUESTED: 'badge-orange',
      RESPONSE_RECEIVED: 'badge-teal', FINDINGS_RECORDED: 'badge-purple',
      ASSESSMENT_PROPOSED: 'badge-indigo', SUPERVISOR_REVIEW: 'badge-yellow',
      ASSESSMENT_APPROVED: 'badge-success', DEMAND_ISSUED: 'badge-danger',
      PAID: 'badge-green', PARTIALLY_PAID: 'badge-lime',
      APPEALED: 'badge-pink', CLOSED: 'badge-dark', CANCELLED: 'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string { return s?.replace(/_/g, ' ') ?? s; }

  getTypeClass(t: string): string {
    const m: Record<string, string> = {
      DESK: 'type-desk', FIELD: 'type-field', COMPREHENSIVE: 'type-comp',
      VAT: 'type-vat', REFUND: 'type-refund', SPECIAL: 'type-special'
    };
    return m[t] ?? '';
  }

  getTypeLabel(t: string): string {
    const m: Record<string, string> = {
      DESK: 'Desk', FIELD: 'Field', COMPREHENSIVE: 'Comprehensive',
      VAT: 'VAT', REFUND: 'Refund', SPECIAL: 'Special'
    };
    return m[t] ?? t;
  }

  getTaxTypeLabel(t: string): string {
    const m: Record<string, string> = { INCOME_TAX: 'Income Tax', VAT: 'VAT', AIT: 'AIT' };
    return m[t] ?? t;
  }
}
