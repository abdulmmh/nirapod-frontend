import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AuditService } from '../../service/audit.service';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { ToastService } from '../../../../shared/toast/toast.service';
import { FiscalYear } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-audit-create',
  templateUrl: './audit-create.component.html',
  styleUrls: ['./audit-create.component.css'],
})
export class AuditCreateComponent implements OnInit, OnDestroy {
  auditForm!: FormGroup;
  taxpayerSearchControl = new FormControl('');
  isSubmitting = false;

  // Taxpayer search
  searchQuery = '';
  isSearching = false;
  taxpayerResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;
  hasSearched = false;

  fiscalYears: FiscalYear[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private auditService: AuditService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFiscalYears();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(): void {
    this.auditForm = this.fb.group({
      taxpayerId: [null, Validators.required],
      taxpayerName: [''],
      tinDisplay: [{ value: '', disabled: true }],
      auditType: ['', Validators.required],
      taxType: ['', Validators.required],
      triggerReason: ['', Validators.required],
      fiscalYear: [''],
      taxPeriodStart: [''],
      taxPeriodEnd: [''],
      riskScore: [0],
      priority: ['NORMAL'],
      returnReference: [''],
      assignedOfficerId: [null],
      assignedOfficerName: [''],
      supervisorId: [null],
      supervisorName: [''],
      scheduledDate: [''],
      dueDate: [''],
      remarks: [''],
    });
  }

  private loadFiscalYears(): void {
    this.http
      .get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.fiscalYears = years.sort((a, b) =>
            b.yearName.localeCompare(a.yearName),
          );
        },
        error: () => {
          this.fiscalYears = [];
          this.toast.warning('Could not load fiscal year list.');
        },
      });
  }

  get f() {
    return this.auditForm.controls;
  }

  // ── Taxpayer Search — exact same pattern as tin-create ─────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.taxpayerResults = [];
      this.showResults = false;
      this.hasSearched = false;
    }
  }

  /** Called by Search button */
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.toast.warning('Enter a name or TIN to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http
      .get<Taxpayer[]>(url)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false)),
      )
      .subscribe({
        next: (data) => {
          this.taxpayerResults = data;
          this.showResults = true;
          this.hasSearched = true;
          if (data.length === 0)
            this.toast.info(
              'No taxpayer found. Check the name or TIN and try again.',
            );
        },
        error: () =>
          this.toast.error('Taxpayer search failed. Please try again.'),
      });
  }

  selectTaxpayer(tp: Taxpayer): void {
    this.selectedTaxpayer = tp;
    const name = this.getDisplayName(tp);
    const tin = tp.tinNumber || '';

    this.auditForm.patchValue({
      taxpayerId: tp.id,
      taxpayerName: name,
      tinDisplay: tin,
    });
    this.taxpayerSearchControl.setValue(name);
    this.searchQuery = name;
    this.showResults = false;
    this.taxpayerResults = [];
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.auditForm.patchValue({
      taxpayerId: null,
      taxpayerName: '',
      tinDisplay: '',
    });
    this.taxpayerSearchControl.setValue('');
    this.searchQuery = '';
    this.taxpayerResults = [];
    this.showResults = false;
    this.hasSearched = false;
  }

  getDisplayName(tp: Taxpayer): string {
    const type = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return type.includes('company')
      ? tp.companyName || 'Unknown Company'
      : tp.fullName || 'Unknown Individual';
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  onCancel(): void {
    this.router.navigate(['/audits']);
  }

  // ── Risk Bar ───────────────────────────────────────────────────────────────

  getRiskClass(score: number): string {
    if (score >= 75) return 'risk-critical';
    if (score >= 50) return 'risk-high';
    if (score >= 25) return 'risk-medium';
    return 'risk-low';
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.auditForm.invalid) {
      this.auditForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const raw = this.auditForm.getRawValue();

    const payload = {
      taxpayerId: raw.taxpayerId,
      auditType: raw.auditType,
      taxType: raw.taxType,
      triggerReason: raw.triggerReason,
      fiscalYear: raw.fiscalYear || undefined,
      taxPeriodStart: raw.taxPeriodStart || undefined,
      taxPeriodEnd: raw.taxPeriodEnd || undefined,
      riskScore: raw.riskScore,
      priority: raw.priority,
      returnReference: raw.returnReference || undefined,
      assignedOfficerName: raw.assignedOfficerName || undefined,
      supervisorName: raw.supervisorName || undefined,
      scheduledDate: raw.scheduledDate || undefined,
      dueDate: raw.dueDate || undefined,
      remarks: raw.remarks || undefined,
    };

    this.auditService
      .createCase(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.toast.success('Audit case created successfully.');
          this.router.navigate(['/audits', created.id]);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }
}
