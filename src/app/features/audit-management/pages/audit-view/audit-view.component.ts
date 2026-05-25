import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuditService } from '../../service/audit.service';
import {
  AuditCase, AuditQuery, AuditDocumentRequest, AuditFinding,
  Assessment, DemandNotice
} from '../../../../models/audit.model';

@Component({
  selector: 'app-audit-view',
  templateUrl: './audit-view.component.html',
  styleUrls: ['./audit-view.component.css']   // ← .css not .scss
})
export class AuditDetailComponent implements OnInit {

  auditCase:    AuditCase | null       = null;
  queries:      AuditQuery[]           = [];
  docRequests:  AuditDocumentRequest[] = [];
  findings:     AuditFinding[]         = [];
  assessment:   Assessment | null      = null;
  demandNotice: DemandNotice | null    = null;

  isLoading       = false;
  queriesLoading  = false;
  docsLoading     = false;
  findingsLoading = false;

  activeTab = 'overview';

  showQueryModal     = false;
  showDocModal       = false;
  showFindingModal   = false;
  showApprovalModal  = false;

  querySubmitting    = false;
  docSubmitting      = false;
  findingSubmitting  = false;
  approvalSubmitting = false;

  approvalNotes = '';

  queryForm!:   FormGroup;
  docForm!:     FormGroup;
  findingForm!: FormGroup;

  get findingsTotalTax(): number {
    return this.findings.reduce((s, f) => s + (f.additionalTax || 0), 0);
  }

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private fb:           FormBuilder,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCase(id);
  }

  buildForms(): void {
    this.queryForm = this.fb.group({
      queryType: ['GENERAL'],
      subject:   ['', Validators.required],
      queryText: ['', Validators.required],
      deadline:  [''],
    });
    this.docForm = this.fb.group({
      requestedDocuments: ['', Validators.required],
      requestReason:      [''],
      requestType:        ['INITIAL'],
      deadline:           [''],
    });
    this.findingForm = this.fb.group({
      findingType:    ['INCOME_OMISSION', Validators.required],
      description:    ['', Validators.required],
      legalBasis:     [''],
      declaredAmount: [0],
      assessedAmount: [0],
      additionalTax:  [0],
      status:         ['DRAFT'],
    });
  }

  loadCase(id: number): void {
    this.isLoading = true;
    this.auditService.getCaseById(id).subscribe({
      next: c => { this.auditCase = c; this.isLoading = false; },
      error: () => { this.isLoading = false; this.router.navigate(['/audits']); }
    });
  }

  setTab(tab: string): void { this.activeTab = tab; }

  loadQueries(): void {
    if (!this.auditCase) return;
    this.queriesLoading = true;
    this.auditService.getQueries(this.auditCase.id).subscribe({
      next: q => { this.queries = q; this.queriesLoading = false; },
      error: () => { this.queriesLoading = false; }
    });
  }

  loadDocRequests(): void {
    if (!this.auditCase) return;
    this.docsLoading = true;
    this.auditService.getDocumentRequests(this.auditCase.id).subscribe({
      next: d => { this.docRequests = d; this.docsLoading = false; },
      error: () => { this.docsLoading = false; }
    });
  }

  loadFindings(): void {
    if (!this.auditCase) return;
    this.findingsLoading = true;
    this.auditService.getFindings(this.auditCase.id).subscribe({
      next: f => { this.findings = f; this.findingsLoading = false; },
      error: () => { this.findingsLoading = false; }
    });
  }

  loadAssessment(): void {
    if (!this.auditCase?.hasAssessment) return;
    this.auditService.getAssessment(this.auditCase.id).subscribe({
      next: a => this.assessment = a, error: () => {}
    });
  }

  loadDemand(): void {
    if (!this.auditCase?.hasDemandNotice) return;
    this.auditService.getDemandNotice(this.auditCase.id).subscribe({
      next: d => this.demandNotice = d, error: () => {}
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  onBack(): void { this.router.navigate(['/audits']); }

  onEdit(): void {
    if (this.auditCase) this.router.navigate(['/audits', this.auditCase.id, 'edit']);
  }

  // ── Workflow Actions ───────────────────────────────────────────────────────

  issueNotice(): void {
    if (!this.auditCase) return;
    this.auditService.issueNotice(this.auditCase.id).subscribe({
      next: c => { this.auditCase = c; }
    });
  }

  issueDemand(): void {
    if (!this.auditCase) return;
    this.auditService.issueDemandNotice(this.auditCase.id).subscribe({
      next: d => { this.demandNotice = d; this.loadCase(this.auditCase!.id); this.setTab('demand'); }
    });
  }

  goToAssessment(): void {
    this.router.navigate(['/audits', this.auditCase!.id, 'propose-assessment']);
  }

  // ── Modal Openers ──────────────────────────────────────────────────────────

  openQueryModal():     void { this.queryForm.reset({ queryType: 'GENERAL' });                            this.showQueryModal = true; }
  openDocRequestModal(): void { this.docForm.reset({ requestType: 'INITIAL' });                           this.showDocModal = true; }
  openFindingModal():   void { this.findingForm.reset({ findingType: 'INCOME_OMISSION', status: 'DRAFT' }); this.showFindingModal = true; }
  openApprovalModal():  void { this.approvalNotes = '';                                                   this.showApprovalModal = true; }

  // ── Modal Submits ──────────────────────────────────────────────────────────

  submitQuery(): void {
    if (this.queryForm.invalid || !this.auditCase) return;
    this.querySubmitting = true;
    this.auditService.raiseQuery(this.auditCase.id, this.queryForm.value).subscribe({
      next: q => {
        this.queries.push(q); this.querySubmitting = false; this.showQueryModal = false;
        this.auditCase!.queryCount++; this.auditCase!.openQueryCount++;
      },
      error: () => { this.querySubmitting = false; }
    });
  }

  submitDocRequest(): void {
    if (this.docForm.invalid || !this.auditCase) return;
    this.docSubmitting = true;
    this.auditService.requestDocuments(this.auditCase.id, this.docForm.value).subscribe({
      next: d => {
        this.docRequests.push(d); this.docSubmitting = false; this.showDocModal = false;
        this.auditCase!.documentRequestCount++;
      },
      error: () => { this.docSubmitting = false; }
    });
  }

  submitFinding(): void {
    if (this.findingForm.invalid || !this.auditCase) return;
    this.findingSubmitting = true;
    this.auditService.addFinding(this.auditCase.id, this.findingForm.value).subscribe({
      next: f => {
        this.findings.push(f); this.findingSubmitting = false; this.showFindingModal = false;
        this.auditCase!.findingCount++; this.loadCase(this.auditCase!.id);
      },
      error: () => { this.findingSubmitting = false; }
    });
  }

  submitApproval(): void {
    if (!this.auditCase) return;
    this.approvalSubmitting = true;
    this.auditService.approveAssessment(this.auditCase.id, this.approvalNotes).subscribe({
      next: a => {
        this.assessment = a; this.approvalSubmitting = false;
        this.showApprovalModal = false; this.loadCase(this.auditCase!.id);
      },
      error: () => { this.approvalSubmitting = false; }
    });
  }

  calculateTaxFromFinding(): void {
    const declared = this.findingForm.get('declaredAmount')?.value || 0;
    const assessed = this.findingForm.get('assessedAmount')?.value || 0;
    const variance = assessed - declared;
    if (variance > 0) {
      this.findingForm.patchValue({ additionalTax: +(variance * 0.25).toFixed(2) });
    }
  }

  // ── Permission Guards ──────────────────────────────────────────────────────

  canRequestDocuments(): boolean {
    return !!this.auditCase && !['CLOSED','CANCELLED','PAID'].includes(this.auditCase.status);
  }
  canRaiseQuery(): boolean {
    return !!this.auditCase && !['CLOSED','CANCELLED','PAID'].includes(this.auditCase.status);
  }
  canAddFinding(): boolean {
    return !!this.auditCase && ['UNDER_REVIEW','RESPONSE_RECEIVED',
      'FINDINGS_RECORDED','DOCUMENT_REQUESTED'].includes(this.auditCase.status);
  }
  canProposeAssessment(): boolean {
    return !!this.auditCase && ['FINDINGS_RECORDED','RESPONSE_RECEIVED','UNDER_REVIEW']
      .includes(this.auditCase.status) && !this.auditCase.hasAssessment;
  }
  canApproveAssessment(): boolean {
    return !!this.auditCase && ['ASSESSMENT_PROPOSED','SUPERVISOR_REVIEW']
      .includes(this.auditCase.status) && this.auditCase.hasAssessment;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  isDue(d: string): boolean { return !!d && new Date(d) < new Date(); }

  getStatusClass(s: string): string {
    const m: Record<string,string> = {
      SELECTED:'badge-secondary', CASE_CREATED:'badge-info', NOTICE_ISSUED:'badge-warning',
      UNDER_REVIEW:'badge-primary', DOCUMENT_REQUESTED:'badge-orange', RESPONSE_RECEIVED:'badge-teal',
      FINDINGS_RECORDED:'badge-purple', ASSESSMENT_PROPOSED:'badge-indigo',
      SUPERVISOR_REVIEW:'badge-yellow', ASSESSMENT_APPROVED:'badge-success',
      DEMAND_ISSUED:'badge-danger', PAID:'badge-green', PARTIALLY_PAID:'badge-lime',
      APPEALED:'badge-pink', CLOSED:'badge-dark', CANCELLED:'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string  { return s?.replace(/_/g,' ') ?? s; }

  getTypeLabel(t: string): string {
    const m: Record<string,string> = {
      DESK:'Desk', FIELD:'Field', COMPREHENSIVE:'Comprehensive',
      VAT:'VAT', REFUND:'Refund', SPECIAL:'Special'
    };
    return m[t] ?? t;
  }

  getTaxTypeLabel(t: string): string {
    const m: Record<string,string> = { INCOME_TAX:'Income Tax', VAT:'VAT', AIT:'AIT' };
    return m[t] ?? t;
  }

  getTriggerLabel(t: string): string {
    const m: Record<string,string> = {
      RISK_BASED:'Risk-Based', RANDOM:'Random', REFUND_CLAIM:'Large Refund',
      MISMATCH:'Mismatch', LATE_FILING:'Late Filing', COMPLAINT:'Complaint',
      DIRECTIVE:'Directive', CAMPAIGN:'Campaign',
    };
    return m[t] ?? t;
  }

  getPriorityClass(p: string): string {
    const m: Record<string,string> = {
      LOW:'pri-low', NORMAL:'pri-normal', HIGH:'pri-high', CRITICAL:'pri-critical'
    };
    return m[p] ?? '';
  }

  getRiskNumClass(score: number): string {
    if (score >= 75) return 'risk-num-critical';
    if (score >= 50) return 'risk-num-high';
    if (score >= 25) return 'risk-num-med';
    return 'risk-num-low';
  }

  getDocStatusClass(s: string): string {
    const m: Record<string,string> = {
      PENDING:'badge-warning', FULFILLED:'badge-success',
      PARTIALLY_FULFILLED:'badge-lime', OVERDUE:'badge-danger',
    };
    return m[s] ?? 'badge-secondary';
  }

  getDemandStatusClass(s: string): string {
    const m: Record<string,string> = {
      ISSUED:'badge-danger', PARTIALLY_PAID:'badge-orange',
      PAID:'badge-success', APPEALED:'badge-pink', CANCELLED:'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getFindingStatusClass(s: string): string {
    const m: Record<string,string> = {
      DRAFT:'badge-secondary', CONFIRMED:'badge-success',
      DISPUTED:'badge-warning', WITHDRAWN:'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }
}