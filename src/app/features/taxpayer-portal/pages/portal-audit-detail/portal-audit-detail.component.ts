import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../../audit-management/service/audit.service';
import {
  AuditCase, AuditQuery, AuditDocumentRequest, Assessment, DemandNotice
} from '../../../../models/audit.model';

@Component({
  selector: 'app-portal-audit-detail',
  templateUrl: './portal-audit-detail.component.html',
  styleUrls: ['./portal-audit-detail.component.scss']
})
export class PortalAuditDetailComponent implements OnInit {

  auditCase:    AuditCase | null    = null;
  queries:      AuditQuery[]        = [];
  docRequests:  AuditDocumentRequest[] = [];
  assessment:   Assessment | null   = null;
  demandNotice: DemandNotice | null = null;

  isLoading     = false;
  queriesLoading = false;
  docsLoading   = false;
  activeTab     = 'overview';

  // Per-query response text
  queryResponses:    Record<number, string> = {};
  respondingQueryId: number | null = null;

  // Per-docRequest file maps
  selectedFiles:      Record<number, File[]> = {};
  uploadDescriptions: Record<number, string> = {};
  uploadingId:        number | null = null;
  dragOverId:         number | null = null;

  caseId = 0;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.auditService.getMyAuditById(this.caseId).subscribe({
      next: c => {
        this.auditCase = c;
        this.isLoading = false;
        // Auto-load demand if issued
        if (c.hasDemandNotice) this.loadDemand();
      },
      error: () => { this.isLoading = false; this.router.navigate(['/my-portal/audits']); }
    });
  }

  setTab(tab: string): void { this.activeTab = tab; }

  loadQueries(): void {
    this.queriesLoading = true;
    this.auditService.getQueries(this.caseId).subscribe({
      next: q => { this.queries = q; this.queriesLoading = false; },
      error: () => { this.queriesLoading = false; }
    });
  }

  loadDocRequests(): void {
    this.docsLoading = true;
    this.auditService.getDocumentRequests(this.caseId).subscribe({
      next: d => { this.docRequests = d; this.docsLoading = false; },
      error: () => { this.docsLoading = false; }
    });
  }

  loadAssessment(): void {
    if (!this.auditCase?.hasAssessment) return;
    this.auditService.getMyAssessment(this.caseId).subscribe({
      next: a => this.assessment = a,
      error: () => {}
    });
  }

  loadDemand(): void {
    if (!this.auditCase?.hasDemandNotice) return;
    this.auditService.getMyDemandNotice(this.caseId).subscribe({
      next: d => this.demandNotice = d,
      error: () => {}
    });
  }

  requiresAction(): boolean {
    if (!this.auditCase) return false;
    return this.auditCase.status === 'DOCUMENT_REQUESTED'
      || this.auditCase.openQueryCount > 0;
  }

  scrollToRespond(): void {
    const el = document.getElementById('respond-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (this.auditCase!.openQueryCount > 0) this.setTab('queries');
    else this.setTab('documents');
  }

  // ── Query response ─────────────────────────────────────────────────────────
  respondToQuery(queryId: number): void {
    const text = this.queryResponses[queryId];
    if (!text?.trim()) return;
    this.respondingQueryId = queryId;
    this.auditService.respond(this.caseId, { responseText: text, queryId }).subscribe({
      next: () => {
        this.respondingQueryId = null;
        const q = this.queries.find(x => x.id === queryId);
        if (q) { q.responseText = text; q.status = 'RESPONDED'; }
        delete this.queryResponses[queryId];
        this.auditCase && this.auditCase.openQueryCount--;
      },
      error: () => { this.respondingQueryId = null; }
    });
  }

  // ── File upload ────────────────────────────────────────────────────────────
  triggerFileInput(drId: number): void {
    const el = document.getElementById('file-input-' + drId) as HTMLInputElement;
    el?.click();
  }

  onFileSelected(event: Event, drId: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles[drId] = Array.from(input.files);
  }

  onDragOver(event: DragEvent, drId: number): void {
    event.preventDefault();
    this.dragOverId = drId;
  }

  onDrop(event: DragEvent, drId: number): void {
    event.preventDefault();
    this.dragOverId = null;
    if (event.dataTransfer?.files) {
      this.selectedFiles[drId] = Array.from(event.dataTransfer.files);
    }
  }

  removeFile(drId: number, idx: number): void {
    this.selectedFiles[drId]?.splice(idx, 1);
  }

  uploadDocuments(drId: number): void {
    const files = this.selectedFiles[drId];
    if (!files?.length) return;
    this.uploadingId = drId;
    this.auditService.uploadDocuments(
      this.caseId, files, drId, this.uploadDescriptions[drId]
    ).subscribe({
      next: () => {
        this.uploadingId = null;
        const dr = this.docRequests.find(x => x.id === drId);
        if (dr) dr.status = 'FULFILLED';
        delete this.selectedFiles[drId];
        delete this.uploadDescriptions[drId];
        this.load(); // refresh status
      },
      error: () => { this.uploadingId = null; }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  downloadAssessment(): void {
    window.open(`/api/my-portal/audits/${this.caseId}/assessment/pdf`, '_blank');
  }

  downloadDemand(): void {
    window.open(`/api/my-portal/audits/${this.caseId}/demand-notice/pdf`, '_blank');
  }

  goToPay(): void {
    this.router.navigate(['/payments/new'], {
      queryParams: { source: 'DEMAND', refId: this.demandNotice?.id }
    });
  }

  goToAppeal(): void {
    this.router.navigate(['/appeals/new'], {
      queryParams: { auditCaseId: this.caseId }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  getDocStatusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'badge-warning', FULFILLED: 'badge-success',
      PARTIALLY_FULFILLED: 'badge-lime', OVERDUE: 'badge-danger',
    };
    return m[s] ?? 'badge-secondary';
  }

  getDemandStatusClass(s: string): string {
    const m: Record<string, string> = {
      ISSUED: 'badge-danger', PARTIALLY_PAID: 'badge-orange',
      PAID: 'badge-success', APPEALED: 'badge-pink', CANCELLED: 'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }
}
