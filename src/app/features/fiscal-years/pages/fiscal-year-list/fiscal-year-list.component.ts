import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fiscal-year-list',
  templateUrl: './fiscal-year-list.component.html',
  styleUrls: ['./fiscal-year-list.component.css'],
})
export class FiscalYearListComponent implements OnInit, OnDestroy {
  years: FiscalYear[] = [];
  isLoading = false;
  settingCurrentId: number | null = null;
  errorMsg = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadFiscalYears();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiscalYears(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.http
      .get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.years = data;
        },
        error: () => {
          this.errorMsg =
            'Failed to load fiscal years. Please refresh the page.';
          this.toast.error(
            'Failed to load fiscal years. Please refresh the page.',
          );
        },
      });
  }

  getStatusClass(s: string): string {
    return s === 'Active'
      ? 'status-active'
      : s === 'Upcoming'
        ? 'status-upcoming'
        : 'status-inactive';
  }

  setCurrent(id: number): void {
    const selected = this.years.find((y) => y.id === id);
    if (!selected || selected.isCurrentYear || this.settingCurrentId !== null) return;

    this.settingCurrentId = id;
    const payload: FiscalYear = {
      ...selected,
      vatDueDay: Number(selected.vatDueDay),
      isCurrentYear: true,
      status: 'Active',
    };

    this.http
      .put<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.UPDATE(id), payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.settingCurrentId = null))
      )
      .subscribe({
        next: () => {
          this.toast.success('Fiscal year set as current.');
          this.loadFiscalYears();
        },
        error: () => {
          this.toast.error('Failed to set fiscal year as current.');
        },
      });
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  edit(id: number): void {
    this.router.navigate(['/fiscal-years/edit', id]);
  }
}
