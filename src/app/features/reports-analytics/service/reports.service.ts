import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  // ─── KPI & Dashboard ─────────────────────────────────────────────────────

  getKpiSummary(fiscalYear: string, zone = '', circle = ''): Observable<KpiSummary> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('zone', zone)
      .set('circle', circle);
    return this.http.get<KpiSummary>(`${API_ENDPOINTS.REPORTS.KPI_SUMMARY}`, { params });
  }

  getRevenueTrend(fiscalYear: string, months = 12): Observable<TrendPoint[]> {
    const params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('months', months.toString());
    return this.http.get<TrendPoint[]>(`${API_ENDPOINTS.REPORTS.REVENUE_TREND}`, { params });
  }

  getTaxBreakdown(fiscalYear: string, zone = ''): Observable<TaxBreakdown[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear).set('zone', zone);
    return this.http.get<TaxBreakdown[]>(`${API_ENDPOINTS.REPORTS.TAX_BREAKDOWN}`, { params });
  }

  getZonePerformance(fiscalYear: string): Observable<ZonePerformance[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear);
    return this.http.get<ZonePerformance[]>(`${API_ENDPOINTS.REPORTS.ZONE_PERFORMANCE}`, { params });
  }

  getComplianceRate(fiscalYear: string, zone = ''): Observable<ComplianceData[]> {
    const params = new HttpParams().set('fiscalYear', fiscalYear).set('zone', zone);
    return this.http.get<ComplianceData[]>(`${API_ENDPOINTS.REPORTS.COMPLIANCE_RATE}`, { params });
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
    return this.http.get<PagedReport<VatCollectionRow>>(`${API_ENDPOINTS.REPORTS.VAT_COLLECTION}`, { params });
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
    return this.http.get<PagedReport<IncomeTaxRow>>(`${API_ENDPOINTS.REPORTS.INCOME_TAX}`, { params });
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
    return this.http.get<PagedReport<PenaltyReportRow>>(`${API_ENDPOINTS.REPORTS.PENALTY_COLLECTION}`, { params });
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
    return this.http.get<PagedReport<RefundReportRow>>(`${API_ENDPOINTS.REPORTS.REFUND_STATUS}`, { params });
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  exportReport(format: 'pdf' | 'excel' | 'csv', req: ReportExportRequest): Observable<Blob> {
    return this.http.post(
      `${API_ENDPOINTS.REPORTS.EXPORT}/${format}`,
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

  getAitDeductionReport(
    fiscalYear: string,
    status: string,
    sourceType: string,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('page', page)
      .set('size', size);

    if (status)     params = params.set('status', status);
    if (sourceType) params = params.set('sourceType', sourceType);

    return this.http.get<any>(
      `${API_ENDPOINTS.REPORTS.AIT_DEDUCTION}`, { params }
    ).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0 })));
  }

  getImportDutyReport(
    fiscalYear: string,
    status: string,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('fiscalYear', fiscalYear)
      .set('page', page)
      .set('size', size);

    if (status) params = params.set('status', status);

    return this.http.get<any>(
      `${API_ENDPOINTS.REPORTS}/import-duty`, { params }
    ).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0 })));
  }

}
