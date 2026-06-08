import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  RefundService,
} from '../../services/refund.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';
import { CreateRefundRequest, EligibleSourceRecord, RefundCalculation, RefundType, RefundTypeOption } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-create',
  templateUrl: './refund-create.component.html',
  styleUrls: ['./refund-create.component.css'],
})
export class RefundCreateComponent implements OnInit {

  // ─── Role check ──────────────────────────────────────────
  isOfficerRole = false;

  // ─── Step 0 (Officer only): Taxpayer selection ───────────
  selectedTaxpayer: any = null;      // Taxpayer entity from taxpayer-search
  selectedTaxpayerId: number | null = null;

  // ─── Stepper ─────────────────────────────────────────────
  // Officers start at step 0 (taxpayer selection)
  // Taxpayers start at step 1
  currentStep = 1;
  totalSteps  = 6;
  saving      = false;
  submitting  = false;
  errorMsg    = '';

  // ─── Step 1: Refund Type ─────────────────────────────────
  selectedRefundType: RefundType | null = null;

  readonly refundTypeOptions: RefundTypeOption[] = [
    { value: 'INCOME_TAX',        label: 'Income Tax',        description: 'ITR overpayment refund',      icon: 'bi bi-file-earmark-text', color: 'type-blue'   },
    { value: 'VAT',               label: 'VAT',               description: 'Excess input credit',         icon: 'bi bi-receipt-cutoff',    color: 'type-teal'   },
    { value: 'AIT',               label: 'AIT',               description: 'Unused AIT credit',           icon: 'bi bi-building-check',    color: 'type-purple' },
    { value: 'DUPLICATE_PAYMENT', label: 'Duplicate Payment', description: 'Double challan submitted',    icon: 'bi bi-copy',              color: 'type-amber'  },
    { value: 'APPEAL_DECISION',   label: 'Appeal Decision',   description: 'Tribunal / court order',      icon: 'bi bi-hammer',            color: 'type-indigo' },
    { value: 'OTHER',             label: 'Other',             description: 'Manual / officer adjustment', icon: 'bi bi-three-dots-circle', color: 'type-gray'   },
  ];

  // ─── Step 2: Source Records ──────────────────────────────
  eligibleSources: EligibleSourceRecord[] = [];
  selectedSourceIds = new Set<number>();
  loadingSources = false;
  sourcesError   = '';

  // ─── Step 3: Calculation ─────────────────────────────────
  calculation: RefundCalculation | null = null;
  requestedAmount = 0;
  calculationError = '';

  // ─── Step 4: Bank Info ───────────────────────────────────
  bankForm: FormGroup;
  bankValidating = false;
  bankValidated  = false;
  bankError      = '';

  // ─── Step 5: Documents ───────────────────────────────────
  uploadedFiles: { file: File; type: string; name: string; size: string }[] = [];
  uploadError     = '';
  selectedDocType = 'BANK_STATEMENT';

  readonly documentTypes = [
    { value: 'BANK_STATEMENT',     label: 'Bank Statement',                required: true  },
    { value: 'ITR_ACKNOWLEDGMENT', label: 'ITR Acknowledgment',            required: false },
    { value: 'CHALLAN_COPY',       label: 'Challan Copy',                  required: false },
    { value: 'COURT_ORDER',        label: 'Court Order / Appeal Decision', required: false },
    { value: 'OTHER',              label: 'Other',                         required: false },
  ];

  // ─── Step 6: Review ──────────────────────────────────────
  declarationAgreed = false;

  constructor(
    private fb: FormBuilder,
    private refundService: RefundService,
    private authService: AuthService,
    private router: Router
  ) {
    this.bankForm = this.fb.group({
      bankName:          ['', Validators.required],
      bankBranch:        ['', Validators.required],
      accountHolderName: ['', Validators.required],
      accountNumber:     ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      routingNumber:     ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      mfsProvider:       [''],
      mfsNumber:         ['', Validators.pattern(/^01\d{9}$/)],
    });
  }

  ngOnInit(): void {
    const role = this.authService.userRole;
    // Officers, supervisors, admins, commissioners need taxpayer selection first
    this.isOfficerRole = role !== Role.TAXPAYER && role !== Role.GUEST;

    if (this.isOfficerRole) {
      // Officers start at step 0 — taxpayer selection
      this.currentStep = 0;
    }
  }

  // ─── Taxpayer selection (Step 0, officer only) ────────────

  onTaxpayerSelected(taxpayer: any): void {
    this.selectedTaxpayer   = taxpayer;
    this.selectedTaxpayerId = taxpayer?.id ?? null;
  }

  onTaxpayerCleared(): void {
    this.selectedTaxpayer   = null;
    this.selectedTaxpayerId = null;
  }

  confirmTaxpayerAndProceed(): void {
    if (!this.selectedTaxpayerId) return;
    this.currentStep = 1;
  }

  // ─── Navigation ───────────────────────────────────────────

  nextStep(): void {
    if (!this.canProceed()) return;
    if (this.currentStep >= this.totalSteps) return;

    // Trigger side-effects BEFORE incrementing
    if (this.currentStep === 1) this.loadSources();
    if (this.currentStep === 2) this.calculateRefund();

    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      if (this.currentStep === 2) {
        this.eligibleSources   = [];
        this.selectedSourceIds = new Set<number>();
        this.sourcesError      = '';
      }
      if (this.currentStep === 3) this.calculation = null;
      this.currentStep--;
    } else if (this.currentStep === 1 && this.isOfficerRole) {
      // Officer goes back to taxpayer selection
      this.currentStep = 0;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep && step >= (this.isOfficerRole ? 0 : 1)) {
      this.currentStep = step;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedRefundType;
      case 2: return this.selectedSourceIds.size > 0;
      case 3: return !!this.calculation
                  && this.requestedAmount > 0
                  && !this.amountExceedsEligible;
      case 4: return this.bankForm.valid && this.bankValidated;
      case 5: return this.hasRequiredDocuments();
      case 6: return this.declarationAgreed;
      default: return false;
    }
  }

  // ─── Resolve taxpayerId ───────────────────────────────────
  // Officer: use selectedTaxpayerId
  // Taxpayer: backend resolves from JWT (no need to send)

  get resolvedTaxpayerId(): number | null {
    if (this.isOfficerRole) return this.selectedTaxpayerId;
    // For taxpayer role — backend resolves from JWT
    return null;
  }

  // ─── Step 2: load sources ─────────────────────────────────

  loadSources(): void {
    if (!this.selectedRefundType) return;
    this.loadingSources = true;
    this.eligibleSources = [];
    this.sourcesError    = '';

    // For officer: pass taxpayerId as query param
    // For taxpayer: backend resolves from JWT
    let obs$;
    switch (this.selectedRefundType) {
      case 'INCOME_TAX': obs$ = this.refundService.getEligibleItrSources(this.resolvedTaxpayerId ?? undefined);      break;
      case 'AIT':        obs$ = this.refundService.getEligibleAitSources(this.resolvedTaxpayerId ?? undefined);      break;
      case 'VAT':        obs$ = this.refundService.getEligibleVatSources(this.resolvedTaxpayerId ?? undefined);      break;
      default:           obs$ = this.refundService.getEligiblePaymentSources(this.resolvedTaxpayerId ?? undefined);  break;
    }

    obs$.subscribe({
      next:  (src) => { this.eligibleSources = src ?? []; this.loadingSources = false; },
      error: (err) => {
        this.loadingSources = false;
        this.sourcesError   = err?.error?.message ?? 'Failed to load eligible source records.';
      },
    });
  }

  toggleSource(id: number): void {
    this.selectedSourceIds.has(id)
      ? this.selectedSourceIds.delete(id)
      : this.selectedSourceIds.add(id);
  }

  isSourceSelected(id: number): boolean { return this.selectedSourceIds.has(id); }

  get selectedSources(): EligibleSourceRecord[] {
    return this.eligibleSources.filter(s => this.selectedSourceIds.has(s.id));
  }

  get selectedSourcesTotalExcess(): number {
    return this.selectedSources.reduce((t, s) => t + (s.excessAmount ?? 0), 0);
  }

  // ─── Step 3: calculate ────────────────────────────────────

  calculateRefund(): void {
    this.calculationError = '';
    this.calculation      = null;

    // FIX: Use sourceTypeFor() to map 'INCOME_TAX' → 'ITR' etc.
    // Previously sent this.selectedRefundType! directly ('INCOME_TAX')
    // which never matched the backend check ("ITR".equalsIgnoreCase(...)).
    this.refundService.calculateRefund(
      this.sourceTypeFor(this.selectedRefundType!),
      Array.from(this.selectedSourceIds),
      this.resolvedTaxpayerId ?? undefined
    ).subscribe({
      next:  (c) => { this.calculation = c; this.requestedAmount = c.eligibleRefundAmount; },
      error: () => { this.calculationError = 'Unable to calculate refund amount. Please try again.'; },
    });
  }

  get amountExceedsEligible(): boolean {
    return this.requestedAmount > (this.calculation?.eligibleRefundAmount ?? 0);
  }

  // ─── Step 4: bank ─────────────────────────────────────────

  validateBank(): void {
    if (this.bankForm.invalid) { this.bankForm.markAllAsTouched(); return; }
    this.bankValidating = true;
    this.bankError      = '';
    this.refundService.validateBankAccount(this.bankForm.value).subscribe({
      next:  (res) => { this.bankValidating = false; this.bankValidated = res.valid; if (!res.valid) this.bankError = res.message; },
      error: () => { this.bankValidating = false; this.bankError = 'Validation service unavailable.'; },
    });
  }

  isFieldInvalid(f: string): boolean {
    const c = this.bankForm.get(f);
    return !!(c?.invalid && c.touched);
  }

  // ─── Step 5: documents ────────────────────────────────────

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 20 * 1024 * 1024) { this.uploadError = 'Max 20 MB.'; return; }
    const ok = ['application/pdf','image/jpeg','image/png','image/jpg'];
    if (!ok.includes(file.type)) { this.uploadError = 'Only PDF, JPG, PNG allowed.'; return; }
    this.uploadError = '';
    this.uploadedFiles.push({ file, type: this.selectedDocType, name: file.name, size: this.formatFileSize(file.size) });
    input.value = '';
  }

  removeFile(i: number): void { this.uploadedFiles.splice(i, 1); }

  formatFileSize(b: number): string {
    return b > 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';
  }

  hasRequiredDocuments(): boolean {
    return this.uploadedFiles.some(f => f.type === 'BANK_STATEMENT');
  }

  getDocTypeLabel(v: string): string {
    return this.documentTypes.find(d => d.value === v)?.label ?? v;
  }

  // ─── Submit ───────────────────────────────────────────────

  submitRefund(): void {
    if (!this.declarationAgreed) return;
    this.submitting = true;
    this.errorMsg   = '';

    const request: CreateRefundRequest = {
      refundType:      this.selectedRefundType!,
      fiscalYearId:    1,
      requestedAmount: this.requestedAmount,
      // For officer: include taxpayerId so backend knows whose refund it is
      ...(this.isOfficerRole && this.selectedTaxpayerId
          ? { taxpayerId: this.selectedTaxpayerId } : {}),
      sources: this.selectedSources.map(s => ({
        sourceType:     this.sourceTypeFor(this.selectedRefundType!),
        sourceRecordId: s.id,
        sourceAmount:   s.excessAmount,
      })),
      bankDetails: this.bankForm.value,
    };

    this.refundService.create(request).subscribe({
      next:  (created) => { this.submitting = false; this.uploadDocsSequentially(created.id, 0); },
      error: () => { this.submitting = false; this.errorMsg = 'Failed to submit. Please try again.'; },
    });
  }

  private uploadDocsSequentially(refundId: number, idx: number): void {
    if (idx >= this.uploadedFiles.length) {
      this.router.navigate(['/refunds/success', refundId]);
      return;
    }
    const f = this.uploadedFiles[idx];
    this.refundService.uploadDocument(refundId, f.file, f.type).subscribe({
      next:  () => this.uploadDocsSequentially(refundId, idx + 1),
      error: () => this.uploadDocsSequentially(refundId, idx + 1),
    });
  }

  private sourceTypeFor(type: RefundType): string {
    const map: Record<RefundType, string> = {
      INCOME_TAX: 'ITR', VAT: 'VAT_RETURN', AIT: 'AIT',
      DUPLICATE_PAYMENT: 'PAYMENT', APPEAL_DECISION: 'APPEAL', OTHER: 'MANUAL',
    };
    return map[type];
  }

  saveDraft(): void { this.saving = true; setTimeout(() => { this.saving = false; }, 800); }
  cancel():    void { this.router.navigate(['/refunds']); }

  formatCurrency(v: number | null): string {
    if (v == null) return '—';
    return '৳ ' + v.toLocaleString('en-BD');
  }

  getRefundTypeLabel(v: RefundType | null): string {
    return this.refundTypeOptions.find(t => t.value === v)?.label ?? '—';
  }

  get stepLabels(): string[] {
    return ['Refund Type', 'Source Records', 'Calculation', 'Bank Info', 'Documents', 'Review'];
  }
}
