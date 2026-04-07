import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-fiscal-year-edit',
  templateUrl: './fiscal-year-edit.component.html',
  styleUrls: ['./fiscal-year-edit.component.css']
})
export class FiscalYearEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  fyId : number | null = null;

  statuses   = ['Active', 'Upcoming', 'Closed'];
  vatDueDays = [10, 15, 20, 25, 30];

  form: Partial<FiscalYear> = {};

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMsg  = 'Invalid business ID. Please go back and try again.';
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
      this.errorMsg  = '';
  
      this.http.get<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.GET(this.fyId!))
        .pipe(takeUntil(this.destroy$)) // FIX #6: Auto-cancel on destroy
        .subscribe({
          next: data => {
            this.form      = { ...data };
            this.isLoading = false;
          },
          // FIX #2: Removed fake fallback data — show a real error instead
          error: () => {
            this.isLoading = false;
            this.errorMsg  = 'Failed to load fiscal year data. Please refresh or go back.';
          }
        });
    }

  isFormValid(): boolean {
    return !!(this.form.yearName         && 
              this.form.startDate        &&
              this.form.endDate          &&
              this.form.vatDueDay        && 
              this.form.incomeTaxDueDate &&
              this.form.status);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields with valid values.';
      return;
    }

    this.isSaving   = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.put(API_ENDPOINTS.FISCAL_YEARS.UPDATE(this.fyId!), this.form)
      .pipe(takeUntil(this.destroy$)) // FIX #6: Auto-cancel on destroy
      .subscribe({
        next: () => {
          this.isSaving   = false;
          this.successMsg = 'Fiscal year updated successfully!';
          setTimeout(() => this.router.navigate(['/fiscal-years']), 1500);
        },
        // FIX #1: Removed navigate() from error handler — user stays to retry
        error: () => {
          this.isSaving  = false;
          this.errorMsg  = 'Failed to update fiscal year. Please try again.';
        }
      });
  }

  onCancel(): void { this.router.navigate(['/fiscal-years']); }
}