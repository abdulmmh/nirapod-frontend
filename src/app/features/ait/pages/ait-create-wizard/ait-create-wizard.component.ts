import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  AitSourceType,
  CreateAitPayload,
  AIT_SOURCE_LABELS,
} from '../../models/ait.model';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { AitService } from '../../services/ait.service';

interface SourceTypeOption {
  value: AitSourceType;
  label: string;
  icon: string;
}

type StepState = 'active' | 'done' | 'pending';

@Component({
  selector: 'app-ait-create-wizard',
  templateUrl: './ait-create-wizard.component.html',
  styleUrls: ['./ait-create-wizard.component.css'],
})
export class AitCreateWizardComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 3;
  isSaving = false;
  isTaxpayerRole = false;
  fiscalYearName = '';

  // Step 1 — Taxpayer
  step1Form!: FormGroup;
  searchControl = new FormControl('');
  searchResults: any[] = [];
  isSearching = false;
  isAutoFilled = false;

  // Step 2 — AIT Details
  step2Form!: FormGroup;
  calculatedAitAmount = 0;

  // Step 3 — Documents
  uploadedFiles: File[] = [];

  sourceTypes: SourceTypeOption[] = [
    { value: 'IMPORT', label: 'Import Duty', icon: 'bi-box-seam' },
    { value: 'SUPPLIER', label: 'Supplier Payment', icon: 'bi-truck' },
    { value: 'SALARY', label: 'Salary Deduction', icon: 'bi-person-badge' },
    { value: 'CONTRACTOR', label: 'Contractor Payment', icon: 'bi-tools' },
    { value: 'RENT', label: 'Rent Payment', icon: 'bi-building' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private aitService: AitService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isTaxpayerRole = this.auth.hasRole(Role.TAXPAYER);
    this.buildForms();

    if (this.isTaxpayerRole) {
      this.autoFillFromCurrentUser();
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        if (term && term.length >= 3 && !this.isAutoFilled) {
          this.searchTaxpayer();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form construction ──────────────────────────────────────────────────────

  buildForms(): void {
    this.step1Form = this.fb.group({
      taxpayerId: [null, Validators.required],
      taxpayerName: [''],
      taxpayerTin: [''],
      taxpayerType: [''],
    });

    this.step2Form = this.fb.group({
      sourceType: ['IMPORT', Validators.required],
      importDutyRecordId: [null],
      hsCode: [''],
      deductorName: [''],
      deductorTin: [''],
      taxableValue: [null, [Validators.required, Validators.min(0.01)]],
      aitRate: [
        null,
        [Validators.required, Validators.min(0.01), Validators.max(100)],
      ],
    });

    // Dynamic validators based on source type
    this.step2Form
      .get('sourceType')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((src) => this.updateConditionalValidators(src));
  }

  private updateConditionalValidators(sourceType: AitSourceType): void {
    const importCtrl = this.step2Form.get('importDutyRecordId')!;
    const deductorCtrl = this.step2Form.get('deductorName')!;

    importCtrl.clearValidators();
    deductorCtrl.clearValidators();

    if (sourceType === 'IMPORT') {
      importCtrl.setValidators(Validators.required);
    } else {
      deductorCtrl.setValidators([
        Validators.required,
        Validators.maxLength(200),
      ]);
    }

    importCtrl.updateValueAndValidity();
    deductorCtrl.updateValueAndValidity();
  }

  // ── Taxpayer search ────────────────────────────────────────────────────────

  searchTaxpayer(): void {
    const term = this.searchControl.value?.trim();
    if (!term) return;

    this.isSearching = true;
    this.aitService
      .searchTaxpayers(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Taxpayer search failed.');
          this.isSearching = false;
        },
      });
  }

  selectTaxpayer(t: any): void {
    this.step1Form.patchValue({
      taxpayerId: t.id,
      taxpayerName: t.fullName || t.companyName,
      taxpayerTin: t.tinNumber,
      taxpayerType: t.taxpayerType,
    });
    this.searchResults = [];
    this.isAutoFilled = true;
  }

  clearSelectedTaxpayer(): void {
    this.step1Form.reset();
    this.searchControl.setValue('');
    this.isAutoFilled = false;
    this.searchResults = [];
  }

  private autoFillFromCurrentUser(): void {
    const user = this.auth.currentUser;
    if (user && user.taxpayerId) {
      this.step1Form.patchValue({
        taxpayerId: user.taxpayerId,
        taxpayerName: user.fullName,
        taxpayerTin: user.tinNumber ?? '',
        taxpayerType: user.taxpayerType ?? '',
      });
      this.isAutoFilled = true;
    }
  }

  // ── Source type ────────────────────────────────────────────────────────────

  selectSourceType(src: AitSourceType): void {
    this.step2Form.patchValue({ sourceType: src });
    this.updateConditionalValidators(src);
  }

  // ── Calculation ────────────────────────────────────────────────────────────

  recalculate(): void {
    const taxable = parseFloat(this.step2Form.get('taxableValue')?.value ?? 0);
    const rate = parseFloat(this.step2Form.get('aitRate')?.value ?? 0);
    if (taxable > 0 && rate > 0) {
      this.calculatedAitAmount =
        Math.round(((taxable * rate) / 100) * 100) / 100;
    } else {
      this.calculatedAitAmount = 0;
    }
  }

  // ── Step navigation ────────────────────────────────────────────────────────

  getStepState(step: number): StepState {
    if (step < this.currentStep) return 'done';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }

  goToStep(step: number): void {
    // Only allow going back to completed steps
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      this.step1Form.markAllAsTouched();
      if (this.step1Form.invalid) return;
    }
    if (this.currentStep === 2) {
      this.step2Form.markAllAsTouched();
      if (this.step2Form.invalid) return;
      this.recalculate();
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ── Document upload ────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.uploadedFiles.length === 0) {
      this.toast.warning('Please upload at least one supporting document.');
      return;
    }

    this.isSaving = true;

    const payload: CreateAitPayload = {
      taxpayerId: this.step1Form.value.taxpayerId,
      sourceType: this.step2Form.value.sourceType,
      importDutyRecordId: this.step2Form.value.importDutyRecordId || undefined,
      hsCode: this.step2Form.value.hsCode || undefined,
      deductorName: this.step2Form.value.deductorName || undefined,
      deductorTin: this.step2Form.value.deductorTin || undefined,
      taxableValue: this.step2Form.value.taxableValue,
      aitRate: this.step2Form.value.aitRate,
    };

    this.aitService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          // Upload documents after record is created
          this.uploadDocuments(created.id!);
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message ?? 'Failed to create AIT record.',
          );
          this.isSaving = false;
        },
      });
  }

  private uploadDocuments(aitId: number): void {
    const uploads = this.uploadedFiles.map((f) =>
      this.aitService.uploadDocument(aitId, f).pipe(takeUntil(this.destroy$)),
    );

    // Sequential upload; switch to forkJoin if parallel is preferred
    let completed = 0;
    const tryNext = () => {
      if (completed >= uploads.length) {
        this.toast.success('AIT record created and documents uploaded.');
        this.isSaving = false;
        this.router.navigate(['/ait', aitId]);
        return;
      }
      uploads[completed].subscribe({
        next: () => {
          completed++;
          tryNext();
        },
        error: (err) => {
          // Non-fatal: record was created, just warn about doc upload failure
          this.toast.warning(
            'Record saved, but one or more documents failed to upload.',
          );
          this.isSaving = false;
          this.router.navigate(['/ait', aitId]);
        },
      });
    };
    tryNext();
  }

  onCancel(): void {
    this.router.navigate(['/ait']);
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  getSourceLabel(source: AitSourceType): string {
    return AIT_SOURCE_LABELS[source] ?? source;
  }

  getSourceClass(source: AitSourceType): string {
    const map: Record<AitSourceType, string> = {
      IMPORT: 'cat-import',
      SUPPLIER: 'cat-supplier',
      SALARY: 'cat-salary',
      CONTRACTOR: 'cat-contractor',
      RENT: 'cat-rent',
    };
    return map[source] ?? '';
  }

  formatCurrency(value: number | null | undefined): string {
    if (!value) return '৳0.00';
    return (
      '৳' +
      value.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
}
