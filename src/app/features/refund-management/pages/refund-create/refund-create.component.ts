import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import {
  RefundService,
  RefundType,
  EligibleSourceRecord,
  RefundCalculation,
  CreateRefundRequest,
} from '../../services/refund.service';

export interface RefundTypeOption {
  value: RefundType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-refund-create',
  templateUrl: './refund-create.component.html',
  styleUrls: ['./refund-create.component.css'],
})
export class RefundCreateComponent implements OnInit {

  // ─── Stepper ─────────────────────────────────────────────
  currentStep = 1;
  totalSteps  = 6;
  saving      = false;
  submitting  = false;
  errorMsg    = '';

  // ─── Step 1: Refund Type ─────────────────────────────────
  selectedRefundType: RefundType | null = null;

  readonly refundTypeOptions: RefundTypeOption[] = [
    { value: 'INCOME_TAX',        label: 'Income Tax',       description: 'ITR overpayment refund',    icon: 'bi bi-file-earmark-text',  color: 'type-blue'   },
    { value: 'VAT',               label: 'VAT',              description: 'Excess input credit',       icon: 'bi bi-receipt-cutoff',     color: 'type-teal'   },
    { value: 'AIT',               label: 'AIT',              description: 'Unused AIT credit',         icon: 'bi bi-building-check',     color: 'type-purple' },
    { value: 'DUPLICATE_PAYMENT', label: 'Duplicate Payment',description: 'Double challan submitted',  icon: 'bi bi-copy',               color: 'type-amber'  },
    { value: 'APPEAL_DECISION',   label: 'Appeal Decision',  description: 'Tribunal / court order',    icon: 'bi bi-hammer',             color: 'type-indigo' },
    { value: 'OTHER',             label: 'Other',            description: 'Manual / officer adjustment',icon: 'bi bi-three-dots-circle', color: 'type-gray'   },
  ];

  // ─── Step 2: Source Records ──────────────────────────────
  eligibleSources: EligibleSourceRecord[] = [];
  selectedSourceIds = new Set<number>();
  loadingSources = false;

  // ─── Step 3: Calculation ─────────────────────────────────
  calculation: RefundCalculation | null = null;
  requestedAmount = 0;
  calculationError = '';

  // ─── Step 4: Bank Info ───────────────────────────────────
  bankForm: FormGroup;
  bankValidating  = false;
  bankValidated   = false;
  bankError       = '';

  // ─── Step 5: Documents ───────────────────────────────────
  uploadedFiles: { file: File; type: string; name: string; size: string }[] = [];
  uploadingFile = false;
  uploadError   = '';

  readonly documentTypes = [
    { value: 'BANK_STATEMENT',      label: 'Bank Statement',     required: true  },
    { value: 'ITR_ACKNOWLEDGMENT',  label: 'ITR Acknowledgment', required: false },
    { value: 'CHALLAN_COPY',        label: 'Challan Copy',       required: false },
    { value: 'COURT_ORDER',         label: 'Court Order / Appeal Decision', required: false },
    { value: 'OTHER',               label: 'Other',              required: false },
  ];
  selectedDocType = 'BANK_STATEMENT';

  // ─── Step 6: Review ──────────────────────────────────────
  declarationAgreed = false;

  // Draft id (saved mid-wizard)
  draftId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private refundService: RefundService,
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

  ngOnInit(): void {}

  // ─── Navigation ───────────────────────────────────────────
  nextStep(): void {
    if (!this.canProceed()) return;
    if (this.currentStep < this.totalSteps) this.currentStep++;
    if (this.currentStep === 2) this.loadSources();
    if (this.currentStep === 3) this.calculateRefund();
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedRefundType;
      case 2: return this.selectedSourceIds.size > 0;
      case 3: return !!this.calculation && this.requestedAmount > 0 && this.requestedAmount <= (this.calculation?.eligibleRefundAmount ?? 0);
      case 4: return this.bankForm.valid && this.bankValidated;
      case 5: return this.hasRequiredDocuments();
      case 6: return this.declarationAgreed;
      default: return false;
    }
  }

  // ─── Step 2 logic ─────────────────────────────────────────
  loadSources(): void {
    this.loadingSources = true;
    this.eligibleSources = [];
    let obs$;
    switch (this.selectedRefundType) {
      case 'INCOME_TAX': obs$ = this.refundService.getEligibleItrSources(); break;
      case 'AIT':        obs$ = this.refundService.getEligibleAitSources(); break;
      case 'VAT':        obs$ = this.refundService.getEligibleVatSources(); break;
      default:           obs$ = this.refundService.getEligiblePaymentSources();
    }
    obs$.subscribe({
      next: (src) => { this.eligibleSources = src; this.loadingSources = false; },
      error: () => { this.loadingSources = false; },
    });
  }

  toggleSource(id: number): void {
    if (this.selectedSourceIds.has(id)) this.selectedSourceIds.delete(id);
    else this.selectedSourceIds.add(id);
  }

  isSourceSelected(id: number): boolean { return this.selectedSourceIds.has(id); }

  get selectedSources(): EligibleSourceRecord[] {
    return this.eligibleSources.filter(s => this.selectedSourceIds.has(s.id));
  }

  get selectedSourcesTotalExcess(): number {
    return this.selectedSources.reduce((total, source) => total + source.excessAmount, 0);
  }

  // ─── Step 3 logic ─────────────────────────────────────────
  calculateRefund(): void {
    this.calculationError = '';
    const ids = Array.from(this.selectedSourceIds);
    this.refundService.calculateRefund(this.selectedRefundType!, ids).subscribe({
      next: (calc) => {
        this.calculation = calc;
        this.requestedAmount = calc.eligibleRefundAmount;
      },
      error: () => {
        this.calculationError = 'Unable to calculate refund amount. Please try again.';
      },
    });
  }

  get amountExceedsEligible(): boolean {
    return this.requestedAmount > (this.calculation?.eligibleRefundAmount ?? 0);
  }

  // ─── Step 4 logic ─────────────────────────────────────────
  validateBank(): void {
    if (this.bankForm.invalid) { this.bankForm.markAllAsTouched(); return; }
    this.bankValidating = true;
    this.bankError = '';
    this.refundService.validateBankAccount(this.bankForm.value).subscribe({
      next: (res) => {
        this.bankValidating = false;
        if (res.valid) { this.bankValidated = true; }
        else { this.bankError = res.message || 'Bank account validation failed.'; }
      },
      error: () => {
        this.bankValidating = false;
        this.bankError = 'Bank validation service unavailable. Please try again.';
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.bankForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  // ─── Step 5 logic ─────────────────────────────────────────
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 20 * 1024 * 1024) {
      this.uploadError = 'File size must not exceed 20 MB.';
      return;
    }
    const allowed = ['application/pdf','image/jpeg','image/png','image/jpg'];
    if (!allowed.includes(file.type)) {
      this.uploadError = 'Only PDF, JPG, and PNG files are allowed.';
      return;
    }
    this.uploadError = '';
    this.uploadedFiles.push({
      file,
      type: this.selectedDocType,
      name: file.name,
      size: this.formatFileSize(file.size),
    });
    input.value = '';
  }

  removeFile(index: number): void { this.uploadedFiles.splice(index, 1); }

  formatFileSize(bytes: number): string {
    return bytes > 1024 * 1024
      ? (bytes / 1024 / 1024).toFixed(1) + ' MB'
      : (bytes / 1024).toFixed(0) + ' KB';
  }

  hasRequiredDocuments(): boolean {
    return this.uploadedFiles.some(f => f.type === 'BANK_STATEMENT');
  }

  getDocTypeLabel(value: string): string {
    return this.documentTypes.find(d => d.value === value)?.label ?? value;
  }

  // ─── Submit ───────────────────────────────────────────────
  submitRefund(): void {
    if (!this.declarationAgreed) return;
    this.submitting = true;
    this.errorMsg   = '';

    const request: CreateRefundRequest = {
      refundType:    this.selectedRefundType!,
      fiscalYearId:  1, // replace with actual FY id from dropdown
      requestedAmount: this.requestedAmount,
      sources: this.selectedSources.map(s => ({
        sourceType:     this.sourceTypeFor(this.selectedRefundType!),
        sourceRecordId: s.id,
        sourceAmount:   s.excessAmount,
      })),
      bankDetails: this.bankForm.value,
    };

    this.refundService.create(request).subscribe({
      next: (created) => {
        this.submitting = false;
        // Upload documents then redirect
        const uploads = this.uploadedFiles.map(f =>
          this.refundService.uploadDocument(created.id, f.file, f.type)
        );
        // Simple sequential approach (can use forkJoin for parallel)
        this.uploadDocumentsAndNavigate(created.id, 0, uploads.length, created.id);
      },
      error: () => {
        this.submitting = false;
        this.errorMsg = 'Failed to submit application. Please try again.';
      },
    });
  }

  private uploadDocumentsAndNavigate(refundId: number, idx: number, total: number, createdId: number): void {
    if (idx >= this.uploadedFiles.length) {
      this.router.navigate(['/refunds/success', createdId]);
      return;
    }
    const f = this.uploadedFiles[idx];
    this.refundService.uploadDocument(refundId, f.file, f.type).subscribe({
      next: () => this.uploadDocumentsAndNavigate(refundId, idx + 1, total, createdId),
      error: () => this.uploadDocumentsAndNavigate(refundId, idx + 1, total, createdId),
    });
  }

  private sourceTypeFor(type: RefundType): string {
    const map: Record<RefundType, string> = {
      INCOME_TAX:        'ITR',
      VAT:               'VAT_RETURN',
      AIT:               'AIT',
      DUPLICATE_PAYMENT: 'PAYMENT',
      APPEAL_DECISION:   'APPEAL',
      OTHER:             'MANUAL',
    };
    return map[type];
  }

  saveDraft(): void {
    // POST create with draft flag
    this.saving = true;
    // ... simplified
    setTimeout(() => { this.saving = false; }, 800);
  }

  cancel(): void { this.router.navigate(['/refunds']); }

  formatCurrency(amount: number | null): string {
    if (amount == null) return '—';
    return '৳ ' + amount.toLocaleString('en-BD');
  }

  getRefundTypeLabel(value: RefundType | null): string {
    return this.refundTypeOptions.find(t => t.value === value)?.label ?? '—';
  }

  get stepLabels(): string[] {
    return ['Refund Type', 'Source Records', 'Calculation', 'Bank Info', 'Documents', 'Review'];
  }
}
