import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import {
  IncomeTaxReturn,
  IncomeTaxReturnUpdateRequest,
  ITRCategory,
  ITRPeriod,
  ITRStatus,
  TaxPreviewResult,
} from '../../../../models/income-tax-return.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-income-tax-return-edit',
  templateUrl: './income-tax-return-edit.component.html',
  styleUrls: ['./income-tax-return-edit.component.css'],
})
export class IncomeTaxReturnEditComponent implements OnInit, OnDestroy {

  isLoading = true;
  isSaving = false;
  isPreviewLoading = false;
  previewError = false;
  itrId = 0;

  assessmentYears: string[] = [];
  incomeYears: string[] = [];

  readonly itrCategories: ITRCategory[] = ['Individual', 'Company', 'Partnership', 'NGO'];
  readonly returnPeriods: ITRPeriod[] = ['Annual', 'Quarterly'];
  readonly statuses: ITRStatus[] = [
    'Draft',
    'Submitted',
    'Under Review',
    'Accepted',
    'Rejected',
    'Overdue',
    'Amended',
    'Send Back',
  ];
  readonly companySubTypes = [
    'Private Limited',
    'Public Limited',
    'Bank',
    'NBFI',
    'Mobile Operator',
    'Other',
  ];

  form: Partial<IncomeTaxReturn> = {};
  previewResult: TaxPreviewResult | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.itrId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAll(): void {
    forkJoin({
      itr: this.http.get<IncomeTaxReturn>(API_ENDPOINTS.INCOME_TAX_RETURNS.GET(this.itrId)),
      fy: this.http.get<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.ACTIVE).pipe(
        catchError(() => of(null as FiscalYear | null)),
      ),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ itr, fy }) => {
          this.form = { ...itr };
          this.buildFiscalYearOptions(fy, itr);
          this.previewResult = this.previewFromRecord(itr);
        },
        error: () => {
          this.toast.error('Failed to load return data.');
          this.router.navigate(['/income-tax-returns']);
        },
      });
  }

  private buildFiscalYearOptions(fy: FiscalYear | null, itr: IncomeTaxReturn): void {
    if (!fy) {
      this.assessmentYears = [itr.assessmentYear].filter(Boolean);
      this.incomeYears = [itr.incomeYear].filter(Boolean);
      return;
    }

    const [startYr] = fy.yearName.split('-').map(Number);
    this.assessmentYears = Array.from({ length: 5 }, (_, i) => {
      const year = startYr - i;
      return `${year}-${String(year + 1).slice(-2)}`;
    });
    this.incomeYears = this.assessmentYears.map((assessmentYear) => {
      const [year] = assessmentYear.split('-').map(Number);
      return `${year - 1}-${String(year).slice(-2)}`;
    });
  }

  private previewFromRecord(itr: IncomeTaxReturn): TaxPreviewResult {
    return {
      taxableIncome: itr.taxableIncome ?? Math.max(0, (itr.grossIncome || 0) - (itr.exemptIncome || 0)),
      effectiveRatePct: itr.taxRate || 0,
      grossTax: itr.grossTax || 0,
      netTaxPayable: itr.netTaxPayable ?? Math.max(0, (itr.grossTax || 0) - (itr.taxRebate || 0)),
    };
  }

  calculatePreview(): void {
    if (!this.form.itrCategory) return;

    this.isPreviewLoading = true;
    this.previewError = false;

    const payload = {
      grossIncome: Number(this.form.grossIncome || 0),
      exemptIncome: Number(this.form.exemptIncome || 0),
      taxRebate: Number(this.form.taxRebate || 0),
      advanceTaxPaid: Number(this.form.advanceTaxPaid || 0),
      withholdingTax: Number(this.form.withholdingTax || 0),
      itrCategory: this.form.itrCategory,
      companySubType: this.form.companySubType || '',
    };

    this.http.post<TaxPreviewResult>(API_ENDPOINTS.INCOME_TAX_RETURNS.PREVIEW, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isPreviewLoading = false)),
      )
      .subscribe({
        next: (result) => (this.previewResult = result),
        error: () => {
          this.previewError = true;
          this.toast.error('Tax preview failed. The server will still recalculate during update.');
        },
      });
  }

  get taxableIncome(): number {
    return this.previewResult?.taxableIncome ?? Math.max(0, (this.form.grossIncome ?? 0) - (this.form.exemptIncome ?? 0));
  }

  get taxRatePreview(): number {
    return this.previewResult?.effectiveRatePct ?? this.form.taxRate ?? 0;
  }

  get grossTaxPreview(): number {
    return this.previewResult?.grossTax ?? this.form.grossTax ?? 0;
  }

  get netTaxPayable(): number {
    return this.previewResult?.netTaxPayable ?? Math.max(0, this.grossTaxPreview - (this.form.taxRebate ?? 0));
  }

  get refundable(): number {
    const totalPaid =
      (this.form.advanceTaxPaid ?? 0) +
      (this.form.withholdingTax ?? 0) +
      (this.form.taxPaid ?? 0);
    return Math.max(0, totalPaid - this.netTaxPayable);
  }

  get balanceDue(): number {
    const totalPaid =
      (this.form.advanceTaxPaid ?? 0) +
      (this.form.withholdingTax ?? 0) +
      (this.form.taxPaid ?? 0);
    return Math.max(0, this.netTaxPayable - totalPaid);
  }

  get showCompanySubType(): boolean {
    return this.form.itrCategory === 'Company';
  }

  isFormValid(): boolean {
    const hasRequiredProfile = !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.itrCategory &&
      this.form.assessmentYear
    );
    const hasCompanyType = this.form.itrCategory !== 'Company' || !!this.form.companySubType;
    const hasValidAmounts =
      Number(this.form.grossIncome || 0) >= 0 &&
      Number(this.form.exemptIncome || 0) >= 0 &&
      Number(this.form.taxRebate || 0) >= 0 &&
      Number(this.form.advanceTaxPaid || 0) >= 0 &&
      Number(this.form.withholdingTax || 0) >= 0 &&
      Number(this.form.taxPaid || 0) >= 0;

    return hasRequiredProfile && hasCompanyType && hasValidAmounts;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    this.http.put(API_ENDPOINTS.INCOME_TAX_RETURNS.UPDATE(this.itrId), this.buildPayload())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Income tax return updated successfully!');
          setTimeout(() => this.router.navigate(['/income-tax-returns/view', this.itrId]), 1500);
        },
        error: (err) => {
          if (err.status === 409) {
            this.toast.error(err.error?.message ?? 'Conflict: another return exists.');
          } else if (err.status === 400) {
            this.toast.error(err.error?.message ?? 'Invalid data. Please check your input.');
          } else {
            this.toast.error('Update failed. Please try again.');
          }
        },
      });
  }

  private buildPayload(): IncomeTaxReturnUpdateRequest {
    return {
      grossIncome: Number(this.form.grossIncome || 0),
      exemptIncome: Number(this.form.exemptIncome || 0),
      taxRebate: Number(this.form.taxRebate || 0),
      advanceTaxPaid: Number(this.form.advanceTaxPaid || 0),
      withholdingTax: Number(this.form.withholdingTax || 0),
      taxPaid: Number(this.form.taxPaid || 0),
      companySubType: this.form.companySubType || '',
      remarks: this.form.remarks || '',
    };
  }

  fmt(amount: number | null | undefined): string {
    return `BDT ${(amount || 0).toLocaleString('en-BD')}`;
  }

  onCancel(): void {
    this.router.navigate(['/income-tax-returns/view', this.itrId]);
  }
}
