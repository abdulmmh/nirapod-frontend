import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-fiscal-year-edit',
  templateUrl: './fiscal-year-edit.component.html',
  styleUrls: ['./fiscal-year-edit.component.css'],
})
export class FiscalYearEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  fyId: number | null = null;

  statuses = ['Active', 'Upcoming', 'Closed'];
  vatDueDays = [10, 15, 20, 25, 30];

  form: FiscalYear = this.getEmptyForm();

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMsg = 'Invalid fiscal year ID. Please go back and try again.';
      this.toast.error('Invalid fiscal year ID. Please go back and try again.');
      return;
    }

    this.fyId = parsedId;
    this.loadFiscalYear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiscalYear(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.http
      .get<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.GET(this.fyId!))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.form = {
            ...data,
            vatDueDay: Number(data.vatDueDay),
            startDate: this.toDateInput(data.startDate),
            endDate: this.toDateInput(data.endDate),
            incomeTaxDueDate: this.toDateInput(data.incomeTaxDueDate),
          };
        },
        error: () => {
          this.errorMsg =
            'Failed to load fiscal year data. Please refresh or go back.';
          this.toast.error(
            'Failed to load fiscal year data. Please refresh or go back.',
          );
        },
      });
  }

  isFormValid(): boolean {
    return !!(
      this.form.yearName &&
      this.form.startDate &&
      this.form.endDate &&
      this.form.vatDueDay &&
      this.form.incomeTaxDueDate &&
      this.form.status &&
      this.hasValidDateRange()
    );
  }

  onStatusChange(): void {
    this.form.isCurrentYear = this.form.status === 'Active';
  }

  onCurrentYearChange(): void {
    this.form.status = this.form.isCurrentYear ? 'Active' : 'Upcoming';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields with valid values.';
      this.toast.error('Please fill in all required fields with valid values.');
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http
      .put(API_ENDPOINTS.FISCAL_YEARS.UPDATE(this.fyId!), this.getPayload())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: () => {
          this.successMsg = 'Fiscal year updated successfully!';
          this.toast.success('Fiscal year updated successfully!');
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/fiscal-years']));
        },
        error: () => {
          this.errorMsg = 'Failed to update fiscal year. Please try again.';
          this.toast.error('Failed to update fiscal year. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/fiscal-years']);
  }

  private getEmptyForm(): FiscalYear {
    return {
      id: 0,
      yearName: '',
      startDate: '',
      endDate: '',
      vatDueDay: 15,
      incomeTaxDueDate: '',
      isCurrentYear: false,
      status: 'Upcoming',
      createdAt: '',
    };
  }

  private hasValidDateRange(): boolean {
    return (
      this.form.startDate <= this.form.endDate &&
      this.form.incomeTaxDueDate >= this.form.startDate &&
      this.form.incomeTaxDueDate <= this.form.endDate
    );
  }

  private getPayload(): FiscalYear {
    const isCurrentYear = this.form.isCurrentYear || this.form.status === 'Active';
    return {
      ...this.form,
      vatDueDay: Number(this.form.vatDueDay),
      isCurrentYear,
      status: isCurrentYear ? 'Active' : this.form.status,
    };
  }

  private toDateInput(value: string): string {
    return value ? value.slice(0, 10) : '';
  }
}
