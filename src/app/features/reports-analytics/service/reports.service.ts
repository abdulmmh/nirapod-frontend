import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import {
  KpiSummary,
  TrendPoint,
  ZonePerformance,
  ComplianceData,
  ReportExportRequest,
  PagedReport,
  VatCollectionRow,
  IncomeTaxRow,
  PenaltyReportRow,
  RefundReportRow,
  TaxBreakdown,
} from '../model/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {

  private base = `${API_ENDPOINTS.REPORTS}`;

  constructor(private http: HttpClient) {}

  // ─── KPI & Dashboard ─────────────────────────────────────────────────────

  getKpiSummary(fiscalYear: string, zone = '', circle = ''): Observable<KpiSummary> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('zone', zone)
      .set('circle', circle);
    return this.http.get<KpiSummary>(`${this.base}/kpi-summary`, { params });
  }

  getRevenueTrend(fiscalYear: string, months = 12): Observable<TrendPoint[]> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('months', months.toString());
    return this.http.get<TrendPoint[]>(`${this.base}/revenue-trend`, { params });
  }

  getTaxBreakdown(fiscalYear: string, zone = ''): Observable<TaxBreakdown[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear).set('zone', zone);
    return this.http.get<TaxBreakdown[]>(`${this.base}/tax-breakdown`, { params });
  }

  getZonePerformance(fiscalYear: string): Observable<ZonePerformance[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear);
    return this.http.get<ZonePerformance[]>(`${this.base}/zone-performance`, { params });
  }

  getComplianceRate(fiscalYear: string, zone = ''): Observable<ComplianceData[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear).set('zone', zone);
    return this.http.get<ComplianceData[]>(`${this.base}/compliance-rate`, { params });
  }

  // ─── Detail Reports (paginated) ───────────────────────────────────────────

  getVatCollectionReport(
    fiscalYear: string,
    zone = '',
    circle = '',
    status = '',
    page = 0,
    size = 20
  ): Observable<PagedReport<VatCollectionRow>> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('zone', zone)
      .set('circle', circle)
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedReport<VatCollectionRow>>(`${this.base}/vat-collection`, { params });
  }

  getIncomeTaxReport(
    fiscalYear: string,
    status = '',
    taxpayerType = '',
    page = 0,
    size = 20
  ): Observable<PagedReport<IncomeTaxRow>> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('status', status)
      .set('taxpayerType', taxpayerType)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedReport<IncomeTaxRow>>(`${this.base}/income-tax`, { params });
  }

  getPenaltyReport(
    fiscalYear: string,
    severity = '',
    status = '',
    page = 0,
    size = 20
  ): Observable<PagedReport<PenaltyReportRow>> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('severity', severity)
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedReport<PenaltyReportRow>>(`${this.base}/penalty-collection`, { params });
  }

  getRefundReport(
    fiscalYear: string,
    status = '',
    page = 0,
    size = 20
  ): Observable<PagedReport<RefundReportRow>> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedReport<RefundReportRow>>(`${this.base}/refund-status`, { params });
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  exportReport(format: 'pdf' | 'excel' | 'csv', req: ReportExportRequest): Observable<Blob> {
    return this.http.post(
      `${this.base}/export/${format}`,
      req,
      { responseType: 'blob' }
    );
  }

  // ─── Helper: Trigger file download in browser ─────────────────────────────

  triggerBlobDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
