import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-income-tax-return-edit',
  templateUrl: './income-tax-return-edit.component.html',
  styleUrls: ['./income-tax-return-edit.component.css']
})
export class IncomeTaxReturnEditComponent implements OnInit, OnDestroy {

  isLoading = true;
  isSaving  = false;
  itrId     = 0;

  private destroy$ = new Subject<void>();

  itrCategories   = ['Individual', 'Company', 'Partnership', 'NGO'];
  returnPeriods   = ['Annual', 'Quarterly'];
  assessmentYears = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
  incomeYears     = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];
  statuses        = ['Draft', 'Submitted', 'Accepted', 'Rejected', 'Overdue', 'Under Review', 'Amended'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.itrId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.http.get<IncomeTaxReturn>(API_ENDPOINTS.INCOME_TAX_RETURNS.GET(this.itrId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.form = { ...data };
        },
        error: () => {
          this.toast.error('Failed to load income tax return data.');
          this.router.navigate(['/income-tax-returns']);
        }
      });
  }

  // ── Calculated Fields ──

  get taxableIncome(): number {
    return Math.max(0, (this.form.grossIncome || 0) - (this.form.exemptIncome || 0));
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.grossTax || 0) - (this.form.taxRebate || 0));
  }

  get refundable(): number {
    const totalPaid = (this.form.advanceTaxPaid || 0)
      + (this.form.withholdingTax || 0)
      + (this.form.taxPaid || 0);
    return Math.max(0, totalPaid - this.netTaxPayable);
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.itrCategory &&
      this.form.assessmentYear
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;

    this.http.put(API_ENDPOINTS.INCOME_TAX_RETURNS.UPDATE(this.itrId), this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('Income tax return updated successfully!');
          setTimeout(() => this.router.navigate(['/income-tax-returns/view', this.itrId]), 1500);
        },
        error: (err) => {
          if (err.status === 409) {
            this.toast.error(err.error?.message || 'Conflict: another return exists for this TIN and year.');
          } else {
            this.toast.error('Failed to update income tax return. Please try again.');
          }
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/income-tax-returns/view', this.itrId]);
  }
}
