import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  RefundFilterRequest, PagedResponse, RefundSummary, RefundDetail,
  CreateRefundRequest, RespondRequest, RefundStatusHistory,
  EligibleSourceRecord, RefundCalculation, BankDetails, RefundDocument,
} from 'src/app/models/refund.model';


@Injectable({ providedIn: 'root' })
export class RefundService {
  constructor(private http: HttpClient) {}

  // ── Taxpayer/Officer my refunds ────────────────────────────────

  getMyRefunds(filter: RefundFilterRequest): Observable<PagedResponse<RefundSummary>> {
    let params = new HttpParams()
      .set('page',    filter.page    ?? 0)
      .set('size',    filter.size    ?? 10)
      .set('sortBy',  filter.sortBy  ?? 'submittedAt')
      .set('sortDir', filter.sortDir ?? 'DESC');
    if (filter.status)      params = params.set('status',      filter.status);
    if (filter.refundType)  params = params.set('refundType',  filter.refundType);
    if (filter.fiscalYearId) params = params.set('fiscalYearId', filter.fiscalYearId);
    return this.http.get<PagedResponse<RefundSummary>>(API_ENDPOINTS.REFUNDS.MY, { params });
  }

  getById(id: number): Observable<RefundDetail> {
    return this.http.get<RefundDetail>(API_ENDPOINTS.REFUNDS.GET(id));
  }

  create(request: CreateRefundRequest): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(API_ENDPOINTS.REFUNDS.CREATE, request);
  }

  update(id: number, request: CreateRefundRequest): Observable<RefundDetail> {
    return this.http.put<RefundDetail>(API_ENDPOINTS.REFUNDS.UPDATE(id), request);
  }

  submit(id: number): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(API_ENDPOINTS.REFUNDS.SUBMIT(id), {});
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.REFUNDS.DELETE(id));
  }

  respond(id: number, req: RespondRequest): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(API_ENDPOINTS.REFUNDS.RESPOND(id), req);
  }

  updateStatus(id: number, req: any): Observable<RefundDetail> {
    return this.http.patch<RefundDetail>(API_ENDPOINTS.REFUNDS.UPDATE_STATUS(id), req);
  }

  getStatusHistory(id: number): Observable<RefundStatusHistory[]> {
    return this.http.get<RefundStatusHistory[]>(API_ENDPOINTS.REFUNDS.STATUS_HISTORY(id));
  }

  // ── Source eligibility ─────────────────────────────────────────

  getEligibleItrSources(taxpayerId?: number): Observable<EligibleSourceRecord[]> {
    const params = taxpayerId ? new HttpParams().set('taxpayerId', taxpayerId) : undefined;
    return this.http.get<EligibleSourceRecord[]>(API_ENDPOINTS.REFUNDS.SOURCES.ITR, { params });
  }

  getEligibleAitSources(taxpayerId?: number): Observable<EligibleSourceRecord[]> {
    const params = taxpayerId ? new HttpParams().set('taxpayerId', taxpayerId) : undefined;
    return this.http.get<EligibleSourceRecord[]>(API_ENDPOINTS.REFUNDS.SOURCES.AIT, { params });
  }

  getEligibleVatSources(taxpayerId?: number): Observable<EligibleSourceRecord[]> {
    const params = taxpayerId ? new HttpParams().set('taxpayerId', taxpayerId) : undefined;
    return this.http.get<EligibleSourceRecord[]>(API_ENDPOINTS.REFUNDS.SOURCES.VAT, { params });
  }

  getEligiblePaymentSources(taxpayerId?: number): Observable<EligibleSourceRecord[]> {
    const params = taxpayerId ? new HttpParams().set('taxpayerId', taxpayerId) : undefined;
    return this.http.get<EligibleSourceRecord[]>(API_ENDPOINTS.REFUNDS.SOURCES.PAYMENTS, { params });
  }

  calculateRefund(
    sourceType: string,
    sourceRecordIds: number[],
    taxpayerId?: number,
  ): Observable<RefundCalculation> {
    return this.http.post<RefundCalculation>(API_ENDPOINTS.REFUNDS.CALCULATE, {
      sourceType, sourceRecordIds, taxpayerId,
    });
  }

  validateBankAccount(d: BankDetails): Observable<{ valid: boolean; message: string }> {
    return this.http.post<{ valid: boolean; message: string }>(
      API_ENDPOINTS.REFUNDS.VALIDATE_BANK, d,
    );
  }

  // ── Documents ──────────────────────────────────────────────────

  uploadDocument(id: number, file: File, documentType: string): Observable<RefundDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<RefundDocument>(API_ENDPOINTS.REFUNDS.DOCUMENTS.UPLOAD(id), formData);
  }

  /**
   * FIX: The backend streams the file directly (Content-Disposition: inline).
   * It does NOT return a JSON { url: string } object.
   *
   * Returns an Observable<Blob> so the caller can create an object URL and
   * trigger a download:
   *
   *   this.refundService.downloadDocument(refundId, docId).subscribe(blob => {
   *     const url = URL.createObjectURL(blob);
   *     const a   = document.createElement('a');
   *     a.href = url; a.download = doc.originalFilename;
   *     a.click(); URL.revokeObjectURL(url);
   *   });
   *
   * Auth headers are automatically attached by the HttpClient interceptor.
   */
  downloadDocument(refundId: number, docId: number): Observable<Blob> {
    return this.http.get(
      API_ENDPOINTS.REFUNDS.DOCUMENTS.GET(refundId, docId),
      { responseType: 'blob' },
    );
  }

  deleteDocument(refundId: number, docId: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.REFUNDS.DOCUMENTS.DELETE(refundId, docId));
  }

  // ── Queues ─────────────────────────────────────────────────────

  getOfficerQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.OFFICER);
  }

  getSupervisorQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.SUPERVISOR);
  }

  getFinanceQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.FINANCE);
  }

  // ── Fiscal Years ───────────────────────────────────────────────

  getFiscalYears(): Observable<{ id: number; name: string; isCurrent: boolean }[]> {
    return this.http.get<{ id: number; name: string; isCurrent: boolean }[]>(
      API_ENDPOINTS.FISCAL_YEARS.ACTIVE,
    );
  }
}