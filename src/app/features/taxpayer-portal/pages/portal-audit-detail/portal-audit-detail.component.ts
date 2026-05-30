import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../../audit-management/service/audit.service';
import {
  AuditCase,
  AuditQuery,
  AuditDocumentRequest,
  Assessment,
  DemandNotice,
} from '../../../../models/audit.model';

@Component({
  selector: 'app-portal-audit-detail',
  templateUrl: './portal-audit-detail.component.html',
  styleUrls: ['./portal-audit-detail.component.css'],
})
export class PortalAuditDetailComponent implements OnInit {
  auditCase: AuditCase | null = null;
  queries: AuditQuery[] = [];
  docRequests: AuditDocumentRequest[] = [];
  assessment: Assessment | null = null;
  demandNotice: DemandNotice | null = null;

  isLoading = false;
  queriesLoading = false;
  docsLoading = false;
  activeTab = 'overview';

  queryResponses: Record<number, string> = {};
  respondingQueryId: number | null = null;
  selectedFiles: Record<number, File[]> = {};
  uploadDescriptions: Record<number, string> = {};
  uploadingId: number | null = null;
  dragOverId: number | null = null;

  caseId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auditService: AuditService,
  ) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.auditService.getMyAuditById(this.caseId).subscribe({
      next: (c) => {
        this.auditCase = c;
        this.isLoading = false;
        if (c.hasDemandNotice) this.loadDemand();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/my-portal/audits']);
      },
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  loadQueries(): void {
    this.queriesLoading = true;
    this.auditService.getQueries(this.caseId).subscribe({
      next: (q) => {
        this.queries = q;
        this.queriesLoading = false;
      },
      error: () => {
        this.queriesLoading = false;
      },
    });
  }

  loadDocRequests(): void {
    this.docsLoading = true;
    // Use officer endpoint — taxpayer sees same doc requests
    this.auditService.getDocumentRequests(this.caseId).subscribe({
      next: (d) => {
        this.docRequests = d;
        this.docsLoading = false;
      },
      error: () => {
        this.docsLoading = false;
      },
    });
  }

  loadAssessment(): void {
    if (!this.auditCase?.hasAssessment) return;
    this.auditService.getMyAssessment(this.caseId).subscribe({
      next: (a) => (this.assessment = a),
      error: () => {},
    });
  }

  loadDemand(): void {
    if (!this.auditCase?.hasDemandNotice) return;
    this.auditService.getMyDemandNotice(this.caseId).subscribe({
      next: (d) => (this.demandNotice = d),
      error: () => {},
    });
  }

  requiresAction(): boolean {
    if (!this.auditCase) return false;
    return (
      this.auditCase.status === 'DOCUMENT_REQUESTED' ||
      this.auditCase.openQueryCount > 0
    );
  }

  scrollToRespond(): void {
    if (this.auditCase!.openQueryCount > 0) this.setTab('queries');
    else this.setTab('documents');
    setTimeout(() => {
      const el = document.getElementById('respond-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // ── Query Response ─────────────────────────────────────────────────────────
  respondToQuery(queryId: number): void {
    const text = this.queryResponses[queryId];
    if (!text?.trim()) return;
    this.respondingQueryId = queryId;
    this.auditService
      .respond(this.caseId, { responseText: text, queryId })
      .subscribe({
        next: () => {
          this.respondingQueryId = null;
          const q = this.queries.find((x) => x.id === queryId);
          if (q) {
            q.responseText = text;
            q.status = 'RESPONDED';
          }
          delete this.queryResponses[queryId];
          if (this.auditCase) this.auditCase.openQueryCount--;
        },
        error: () => {
          this.respondingQueryId = null;
        },
      });
  }

  // ── File Upload ────────────────────────────────────────────────────────────
  triggerFileInput(drId: number): void {
    const el = document.getElementById(
      'file-input-' + drId,
    ) as HTMLInputElement;
    el?.click();
  }

  onFileSelected(event: Event, drId: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    // Append to existing — fixes "only last file shows" bug
    const existing = this.selectedFiles[drId] || [];
    this.selectedFiles[drId] = [...existing, ...Array.from(input.files)];
    // Reset input so same file can be selected again
    input.value = '';
  }

  onDragOver(event: DragEvent, drId: number): void {
    event.preventDefault();
    this.dragOverId = drId;
  }

  onDrop(event: DragEvent, drId: number): void {
    event.preventDefault();
    this.dragOverId = null;
    if (event.dataTransfer?.files) {
      const existing = this.selectedFiles[drId] || [];
      this.selectedFiles[drId] = [
        ...existing,
        ...Array.from(event.dataTransfer.files),
      ];
    }
  }

  removeFile(drId: number, idx: number): void {
    this.selectedFiles[drId]?.splice(idx, 1);
  }

  uploadDocuments(drId: number): void {
    const files = this.selectedFiles[drId];
    if (!files?.length) return;
    this.uploadingId = drId;
    this.auditService
      .uploadDocuments(this.caseId, files, drId, this.uploadDescriptions[drId])
      .subscribe({
        next: () => {
          this.uploadingId = null;
          const dr = this.docRequests.find((x) => x.id === drId);
          if (dr) dr.status = 'FULFILLED';
          delete this.selectedFiles[drId];
          delete this.uploadDescriptions[drId];
          this.load();
        },
        error: () => {
          this.uploadingId = null;
        },
      });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── Download & Navigation ──────────────────────────────────────────────────

  downloadAssessment(): void {
    // Print current page as PDF — no backend PDF endpoint needed
    const prevTab = this.activeTab;
    this.activeTab = 'assessment';
    setTimeout(() => {
      window.print();
      this.activeTab = prevTab;
    }, 300);
  }

  downloadDemand(): void {
    const prevTab = this.activeTab;
    this.activeTab = 'demand';
    setTimeout(() => {
      window.print();
      this.activeTab = prevTab;
    }, 300);
  }

  goToPay(): void {
    // Navigate to payments module with demand context
    // Change route below to match your actual payments module route
    this.router.navigate(['/my-portal/payments/new'], {
      queryParams: {
        source: 'DEMAND',
        refId: this.demandNotice?.id,
        demandNo: this.demandNotice?.demandNo,
        amount: this.demandNotice?.amountDue,
      },
    });
  }

  goToAppeal(): void {
    // Navigate to appeals module with audit context
    // Change route below to match your actual appeals module route
    this.router.navigate(['/my-portal/appeals/new'], {
      queryParams: {
        auditCaseId: this.caseId,
        assessmentNo: this.assessment?.assessmentNo,
        caseNo: this.auditCase?.caseNo,
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  isDue(d: string): boolean {
    return !!d && new Date(d) < new Date();
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
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
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string {
    return s?.replace(/_/g, ' ') ?? s;
  }

  getTypeLabel(t: string): string {
    const m: Record<string, string> = {
      DESK: 'Desk',
      FIELD: 'Field',
      COMPREHENSIVE: 'Comprehensive',
      VAT: 'VAT',
      REFUND: 'Refund',
      SPECIAL: 'Special',
    };
    return m[t] ?? t;
  }

  getTaxTypeLabel(t: string): string {
    return { INCOME_TAX: 'Income Tax', VAT: 'VAT', AIT: 'AIT' }[t] ?? t;
  }

  getDocStatusClass(s: string): string {
    return (
      {
        PENDING: 'badge-warning',
        FULFILLED: 'badge-success',
        PARTIALLY_FULFILLED: 'badge-lime',
        OVERDUE: 'badge-danger',
      }[s] ?? 'badge-secondary'
    );
  }

  getDemandStatusClass(s: string): string {
    return (
      {
        ISSUED: 'badge-danger',
        PARTIALLY_PAID: 'badge-orange',
        PAID: 'badge-success',
        APPEALED: 'badge-pink',
        CANCELLED: 'badge-muted',
      }[s] ?? 'badge-secondary'
    );
  }
}
