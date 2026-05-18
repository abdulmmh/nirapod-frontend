import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RefundService,
  RefundDetail,
  RefundType,
  EligibleSourceRecord,
  RefundCalculation,
} from '../../services/refund.service';

@Component({
  selector: 'app-refund-edit',
  templateUrl: './refund-edit.component.html',
  styleUrls: ['./refund-edit.component.css'],
})
export class RefundEditComponent implements OnInit {

  refundId!: number;
  refund: RefundDetail | null = null;
  loading = true;
  saving  = false;
  submitting = false;
  errorMsg = '';

  currentStep = 1;
  totalSteps  = 6;

  // Step 1
  selectedRefundType: RefundType | null = null;

  readonly refundTypeOptions = [
    { value: 'INCOME_TAX'        as RefundType, label: 'Income Tax',        icon: 'bi bi-file-earmark-text',  color: 'type-blue'   },
    { value: 'VAT'               as RefundType, label: 'VAT',               icon: 'bi bi-receipt-cutoff',     color: 'type-teal'   },
    { value: 'AIT'               as RefundType, label: 'AIT',               icon: 'bi bi-building-check',     color: 'type-purple' },
    { value: 'DUPLICATE_PAYMENT' as RefundType, label: 'Duplicate Payment', icon: 'bi bi-copy',               color: 'type-amber'  },
    { value: 'APPEAL_DECISION'   as RefundType, label: 'Appeal Decision',   icon: 'bi bi-hammer',             color: 'type-indigo' },
    { value: 'OTHER'             as RefundType, label: 'Other',             icon: 'bi bi-three-dots-circle',  color: 'type-gray'   },
  ];

  // Step 2
  eligibleSources: EligibleSourceRecord[] = [];
  selectedSourceIds = new Set<number>();
  loadingSources = false;

  // Step 3
  calculation: RefundCalculation | null = null;
  requestedAmount = 0;

  // Step 4
  bankForm: FormGroup;
  bankValidated   = false;
  bankValidating  = false;
  bankError       = '';

  // Step 5
  uploadedFiles: { file: File; type: string; name: string; size: string }[] = [];
  existingDocuments: { id: number; name: string; type: string }[] = [];
  selectedDocType = 'BANK_STATEMENT';
  uploadError     = '';

  readonly documentTypes = [
    { value: 'BANK_STATEMENT',     label: 'Bank Statement',              required: true  },
    { value: 'ITR_ACKNOWLEDGMENT', label: 'ITR Acknowledgment',          required: false },
    { value: 'CHALLAN_COPY',       label: 'Challan Copy',                required: false },
    { value: 'COURT_ORDER',        label: 'Court Order / Appeal Decision',required: false },
    { value: 'OTHER',              label: 'Other',                       required: false },
  ];

  // Step 6
  declarationAgreed = false;

  get stepLabels(): string[] {
    return ['Refund Type', 'Source Records', 'Calculation', 'Bank Info', 'Documents', 'Review'];
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private refundService: RefundService,
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
    this.refundId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRefund();
  }

  loadRefund(): void {
    this.loading = true;
    this.refundService.getById(this.refundId).subscribe({
      next: (r) => {
        if (r.status !== 'DRAFT') {
          this.router.navigate(['/refunds', this.refundId, 'view']);
          return;
        }
        this.refund = r;
        this.populateFromDraft(r);
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Could not load refund details.';
        this.loading = false;
      },
    });
  }

  populateFromDraft(r: RefundDetail): void {
    this.selectedRefundType = r.refundType;
    r.sources?.forEach(s => this.selectedSourceIds.add(s.sourceRecordId));
    this.requestedAmount = r.claimedRefundAmount;

    if (r.bankDetails) {
      this.bankForm.patchValue({
        bankName:          r.bankDetails.bankName,
        bankBranch:        r.bankDetails.bankBranch,
        accountHolderName: r.bankDetails.accountHolderName,
        accountNumber:     r.bankDetails.accountNumber,
        routingNumber:     r.bankDetails.routingNumber,
        mfsProvider:       r.bankDetails.mfsProvider ?? '',
        mfsNumber:         r.bankDetails.mfsNumber ?? '',
      });
      this.bankValidated = r.bankValidated;
    }

    this.existingDocuments = (r.documents ?? []).map(d => ({
      id: d.id, name: d.documentName, type: d.documentType,
    }));
  }

  nextStep(): void {
    if (!this.canProceed()) return;
    if (this.currentStep < this.totalSteps) this.currentStep++;
    if (this.currentStep === 2) this.loadSources();
    if (this.currentStep === 3) this.recalculate();
  }

  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }
  goToStep(s: number): void { if (s < this.currentStep) this.currentStep = s; }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedRefundType;
      case 2: return this.selectedSourceIds.size > 0;
      case 3: return !!this.calculation && this.requestedAmount > 0 && !this.amountExceedsEligible;
      case 4: return this.bankForm.valid && this.bankValidated;
      case 5: return this.hasRequiredDocuments();
      case 6: return this.declarationAgreed;
      default: return false;
    }
  }

  loadSources(): void {
    this.loadingSources = true;
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

  recalculate(): void {
    const ids = Array.from(this.selectedSourceIds);
    this.refundService.calculateRefund(this.selectedRefundType!, ids).subscribe({
      next: (c) => { this.calculation = c; this.requestedAmount = c.eligibleRefundAmount; },
    });
  }

  toggleSource(id: number): void {
    this.selectedSourceIds.has(id)
      ? this.selectedSourceIds.delete(id)
      : this.selectedSourceIds.add(id);
  }

  isSourceSelected(id: number): boolean { return this.selectedSourceIds.has(id); }

  get amountExceedsEligible(): boolean {
    return this.requestedAmount > (this.calculation?.eligibleRefundAmount ?? 0);
  }

  validateBank(): void {
    if (this.bankForm.invalid) { this.bankForm.markAllAsTouched(); return; }
    this.bankValidating = true;
    this.bankError = '';
    this.refundService.validateBankAccount(this.bankForm.value).subscribe({
      next: (res) => {
        this.bankValidating = false;
        this.bankValidated = res.valid;
        if (!res.valid) this.bankError = res.message;
      },
      error: () => { this.bankValidating = false; this.bankError = 'Validation service unavailable.'; },
    });
  }

  isFieldInvalid(f: string): boolean {
    const c = this.bankForm.get(f);
    return !!(c?.invalid && c.touched);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 20 * 1024 * 1024) { this.uploadError = 'Max file size is 20 MB.'; return; }
    this.uploadError = '';
    this.uploadedFiles.push({
      file, type: this.selectedDocType,
      name: file.name, size: this.formatFileSize(file.size),
    });
    input.value = '';
  }

  removeNewFile(i: number): void { this.uploadedFiles.splice(i, 1); }

  removeExistingDoc(docId: number): void {
    if (!confirm('Remove this document?')) return;
    this.refundService.deleteDocument(this.refundId, docId).subscribe({
      next: () => { this.existingDocuments = this.existingDocuments.filter(d => d.id !== docId); },
    });
  }

  hasRequiredDocuments(): boolean {
    const hasExisting = this.existingDocuments.some(d => d.type === 'BANK_STATEMENT');
    const hasNew      = this.uploadedFiles.some(f => f.type === 'BANK_STATEMENT');
    return hasExisting || hasNew;
  }

  getDocTypeLabel(v: string): string {
    return this.documentTypes.find(d => d.value === v)?.label ?? v;
  }

  formatFileSize(bytes: number): string {
    return bytes > 1048576
      ? (bytes / 1048576).toFixed(1) + ' MB'
      : (bytes / 1024).toFixed(0) + ' KB';
  }

  saveAndUpdate(): void {
    this.saving = true;
    const req = this.buildRequest();
    this.refundService.update(this.refundId, req).subscribe({
      next: () => { this.saving = false; },
      error: () => { this.saving = false; this.errorMsg = 'Save failed.'; },
    });
  }

  submitRefund(): void {
    if (!this.declarationAgreed) return;
    this.submitting = true;
    const req = this.buildRequest();
    this.refundService.update(this.refundId, req).subscribe({
      next: () => {
        // upload new docs then submit
        this.uploadAndSubmit(0);
      },
      error: () => { this.submitting = false; this.errorMsg = 'Update failed.'; },
    });
  }

  private uploadAndSubmit(idx: number): void {
    if (idx >= this.uploadedFiles.length) {
      this.refundService.submit(this.refundId).subscribe({
        next: () => this.router.navigate(['/refunds/success', this.refundId]),
        error: () => { this.submitting = false; this.errorMsg = 'Submit failed.'; },
      });
      return;
    }
    const f = this.uploadedFiles[idx];
    this.refundService.uploadDocument(this.refundId, f.file, f.type).subscribe({
      next: () => this.uploadAndSubmit(idx + 1),
      error: () => this.uploadAndSubmit(idx + 1),
    });
  }

  private buildRequest() {
    return {
      refundType:      this.selectedRefundType!,
      fiscalYearId:    1,
      requestedAmount: this.requestedAmount,
      sources: Array.from(this.selectedSourceIds).map(id => ({
        sourceType:     'ITR',
        sourceRecordId: id,
        sourceAmount:   0,
      })),
      bankDetails: this.bankForm.value,
    };
  }

  cancel(): void { this.router.navigate(['/refunds', this.refundId, 'view']); }

  formatCurrency(v: number | null): string {
    if (v == null) return '—';
    return '৳ ' + v.toLocaleString('en-BD');
  }
}
