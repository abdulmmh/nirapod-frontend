import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { DashboardStats, RecentTaxpayer, RecentPayment, DashboardChartData } from '../../../models/dashboard.model';
import { FiscalYear } from '../../../models/fiscal-year.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  constructor(http: HttpClient) { super(http); }

  getStats(year?: string): Observable<DashboardStats> {
    return this.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS, year ? { year } : undefined);
  }
  getRecentTaxpayers(): Observable<RecentTaxpayer[]> {
    return this.get<RecentTaxpayer[]>(API_ENDPOINTS.DASHBOARD.RECENT_TAXPAYERS);
  }
  getRecentPayments(): Observable<RecentPayment[]> {
    return this.get<RecentPayment[]>(API_ENDPOINTS.DASHBOARD.RECENT_PAYMENTS);
  }
  getFiscalYears(): Observable<FiscalYear[]> {
    return this.get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST);
  }
  getChartData(year?: string): Observable<DashboardChartData> {
    const params = year ? { year } : undefined;
    return forkJoin([
      this.get<any[]>(API_ENDPOINTS.DASHBOARD.VAT_CHART, params),
      this.get<any[]>(API_ENDPOINTS.DASHBOARD.PAYMENT_CHART, params),
    ]).pipe(map(([vatChart, paymentChart]) => ({
      vatChart, paymentChart, auditChart: [], myPaymentChart: [],
    })));
  }
  loadAll(year?: string): Observable<any[]> {
    return forkJoin([
      this.getStats(year),
      this.getRecentTaxpayers(),
      this.getRecentPayments(),
      this.getChartData(year),
      of([]), of([]), of([]), of([]),
      this.getFiscalYears(),
      this.get<any[]>(API_ENDPOINTS.DASHBOARD.ZONE_VAT, year ? { year } : undefined),
    ]);
  }
}
