import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { AuditCreateRequest } from '../../../../models/audit.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-audit-create',
  templateUrl: './audit-create.component.html',
  styleUrls: ['./audit-create.component.css'],
})
export class AuditCreateComponent implements OnDestroy {

  // ──────────────── State ────────────────
  isLoading = false;

  // Taxpayer search
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;
  private destroy$ = new Subject<void>();

  form: AuditCreateRequest = this.createEmptyForm();


  // ──────────────── Static Data ────────────────
  readonly auditTypes = [
    'VAT Audit',
    'Income Tax Audit',
    'Full Audit',
    'Desk Audit',
    'Field Audit',
    'Special Audit',
  ];

  readonly priorities = ['Low', 'Medium', 'High', 'Critical'];

  readonly assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];

  readonly auditors = [
    'Auditor Rahim',
    'Auditor Kamal',
    'Auditor Nasrin',
    'Auditor Faruk',
    'Auditor Imran',
    'Auditor Reza',
    'Senior Auditor Hasan',
    'Senior Auditor Mila',
  ];

  readonly supervisors = [
    'Tax Commissioner',
    'Deputy Commissioner',
    'Assistant Commissioner',
    'Senior Tax Officer',
  ];

  // ────────────── Constructor  ────────────────

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ──────────────── Lifecycle ────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Taxpayer Search ──────────────────────────────────────────────────────
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) { this.toast.warning('Enter at least 3 characters.'); return; }
    this.isSearching = true;
    this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST + '?search=' + encodeURIComponent(q))
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSearching = false))
      .subscribe({ next: d => { this.searchResults = d; this.showResults = true; }, error: () => this.toast.error('Search failed.') });
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer = t;
    this.form.taxpayerId = t.id ?? null;
    this.showResults = false;
    const name = t.taxpayerType?.typeName?.toLowerCase().includes('company') ? t.companyName : t.fullName;
    this.toast.success(`Taxpayer "${name}" selected.`);
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.form.taxpayerId = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  getDisplayName(t: Taxpayer): string {
    return t.taxpayerType?.typeName?.toLowerCase().includes('company') ? (t.companyName || '') : (t.fullName || '');
  }

  // ──────────────── Form Factory  ────────────────
  private createEmptyForm(): AuditCreateRequest {
    return {
      taxpayerId: null,
      auditType: '',
      priority: 'Medium',
      assessmentYear: '2024-25',
      returnNo: '',
      scheduledDate: this.getTodayDate(),
      assignedTo: '',
      supervisedBy: '',
      remarks: '',
    };
  }

  // ──────────────── Getters ──────────────── 

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ──────────────── Validation  ────────────────
  isFormValid(): boolean {
    return this.hasRequiredFields();
  }

  private hasRequiredFields(): boolean {
    return !!(
      this.selectedTaxpayer !== null &&
      this.form.auditType &&
      this.form.priority &&
      this.form.scheduledDate &&
      this.form.assignedTo &&
      this.form.supervisedBy
    );
  }

  // ──────────── Actions ───────────────────
  
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    this.isLoading = true;
    this.createAudit();
  }

  private createAudit(): void {
    this.http
      .post(API_ENDPOINTS.AUDITS.CREATE, this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(): void {
    this.toast.success('Audit created successfully!');
    timer(1500).pipe(takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['/audits']));
  }

  private handleError(error: unknown): void {
    console.error('Error creating audit:', error);
    this.toast.error('Failed to create audit. Please try again.');
  }

  onReset(): void {
    this.form = this.createEmptyForm();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/audits']);
  }

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }
}
