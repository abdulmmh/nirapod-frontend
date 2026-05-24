import { Component, OnDestroy, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PenaltyCreateRequest } from '../../../../models/penalty.model';
import { PenaltyService } from '../../services/penalty.service';
import { FiscalYear } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-penalty-create',
  templateUrl: './penalty-create.component.html',
  styleUrls: ['./penalty-create.component.css'],
})
export class PenaltyCreateComponent implements OnDestroy {
  isLoading = false;

  // Taxpayer search
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  interestAmount = 0;
  showResults = false;
  private destroy$ = new Subject<void>();
  successMsg = '';
  errorMsg = '';

  penaltyTypes = [
    'Late Filing',
    'Late Payment',
    'Non-Compliance',
    'Fraud',
    'Underpayment',
    'Other',
  ];
  severities = ['Low', 'Medium', 'High', 'Critical'];
  assessmentYears: FiscalYear[] = [];
  officers = [
    'Tax Officer',
    'Senior Tax Officer',
    'Tax Commissioner',
    'Assistant Commissioner',
    'Deputy Commissioner',
  ];

  form: PenaltyCreateRequest = {
    taxpayerId: null,
    penaltyType: '',
    severity: 'Medium',
    penaltyAmount: 0,
    returnNo: '',
    assessmentYear: '2024-25',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    issuedBy: '',
    description: '',
    remarks: '',
  };

  onPenaltyChange(): void {
    this.interestAmount = Math.round(this.form.penaltyAmount * 0.15);
    this.setDefaultDueDate();
  }

  get totalAmount(): number {
    return this.form.penaltyAmount + this.interestAmount;
  }

  setDefaultDueDate(): void {
    if (this.form.issueDate) {
      const due = new Date(this.form.issueDate);
      due.setDate(due.getDate() + 30);
      this.form.dueDate = due.toISOString().split('T')[0];
    }
  }

  isFormValid(): boolean {
    return !!(
      this.selectedTaxpayer !== null &&
      this.form.penaltyType &&
      this.form.severity &&
      this.form.penaltyAmount > 0 &&
      this.form.issuedBy &&
      this.form.dueDate
    );
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private penaltyService: PenaltyService,
  ) {
    this.setDefaultDueDate();
    this.loadFiscalYears();
  }

  private loadFiscalYears(): void {
    this.http
      .get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.assessmentYears = years.sort((a, b) =>
            b.yearName.localeCompare(a.yearName),
          );
          if (this.assessmentYears.length > 0) {
            this.form.assessmentYear = this.assessmentYears[0].yearName;
          }
        },
        error: () => {
          this.assessmentYears = [];
          this.toast.warning(
            'Could not load fiscal year list. Please try again later.',
          );
        },
      });
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }

    const payload = { ...this.form };
    delete (payload as any).interestAmount;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.penaltyService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMsg = 'Penalty issued successfully!';
          this.toast.success('Penalty issued successfully!');
          timer(1500)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/penalties']));
        },
        error: () => {
          this.isLoading = false;
          this.successMsg = '';
          this.errorMsg = 'Failed to issue penalty. Please try again.';
          this.toast.error('Failed to issue penalty. Please try again.');
        },
      });
  }

  onReset(): void {
    this.interestAmount = 0;
    this.form = {
      taxpayerId: null,
      penaltyType: '',
      severity: 'Medium',
      penaltyAmount: 0,
      returnNo: '',
      assessmentYear: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      issuedBy: '',
      description: '',
      remarks: '',
    };
    this.setDefaultDueDate();
  }

  onCancel(): void {
    this.router.navigate(['/penalties']);
  }

  fmt(val: number): string {
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
  }

  // ── Taxpayer Search ──────────────────────────────────────────────────────
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) {
      return;
    }
    this.isSearching = true;
    this.http
      .get<Taxpayer[]>(
        API_ENDPOINTS.TAXPAYERS.LIST + '?search=' + encodeURIComponent(q),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false)),
      )
      .subscribe({
        next: (d) => {
          this.searchResults = d;
          this.showResults = true;
        },
        error: () => {},
      });
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer = t;
    this.form.taxpayerId = t.id ?? null;
    this.showResults = false;
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.form.taxpayerId = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  getDisplayName(t: Taxpayer): string {
    return t.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? t.companyName || ''
      : t.fullName || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
