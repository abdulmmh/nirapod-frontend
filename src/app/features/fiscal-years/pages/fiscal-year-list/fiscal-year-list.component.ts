import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fiscal-year-list',
  templateUrl: './fiscal-year-list.component.html',
  styleUrls: ['./fiscal-year-list.component.css']
})
export class FiscalYearListComponent implements OnInit {

  years: FiscalYear[] = [];
  isLoading = false;
  errorMsg   = '';

  private destroy$ = new Subject<void>();
  

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFiscalYears();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

loadFiscalYears(): void {
      this.isLoading = true;
      this.errorMsg  = '';
  
      this.http.get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
        .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
        .subscribe({
          next: data => {
            this.years = data;
            this.isLoading  = false;
          },
          // FIX #1: Removed fake fallback — show a real error message instead
          error: () => {
            this.isLoading = false;
            this.errorMsg  = 'Failed to load fiscal years. Please refresh the page.';
          }
        });
    }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Upcoming' ? 'status-upcoming' : 'status-inactive';
  }

  setCurrent(id: number): void {
    this.years = this.years.map(y => ({
      ...y, isCurrentYear: y.id === id,
      status: y.id === id ? 'Active' : y.status === 'Active' ? 'Closed' : y.status
    }));
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

 edit(id: number): void { this.router.navigate(['/fiscal-years/edit', id]); }
}