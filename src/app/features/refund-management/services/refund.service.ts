import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';


// ─── Enums ────────────────────────────────────────────────────────────────────

export type RefundType =
  | 'INCOME_TAX'
  | 'VAT'
  | 'AIT'
  | 'DUPLICATE_PAYMENT'
  | 'APPEAL_DECISION'
  | 'OTHER';

export type RefundStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'INFO_REQUESTED'
  | 'RESPONSE_RECEIVED'
  | 'RECOMMENDED'
  | 'SUPERVISOR_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'CLOSED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Models ───────────────────────────────────────────────────────────────────

export interface RefundSource {
  id?: number;
  sourceType: 'ITR' | 'AIT' | 'VAT_RETURN' | 'PAYMENT' | 'APPEAL' | 'MANUAL';
  sourceRecordId: number;
  sourceReference: string;
  periodStart: string;
  periodEnd: string;
  sourceAmount: number;
  description?: string;
  isVerified?: boolean;
}

export interface BankDetails {
  bankName: string;
  bankBranch: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  mfsProvider?: string;
  mfsNumber?: string;
}

export interface RefundDocument {
  id: number;
  documentType: string;
  documentName: string;
  originalFilename: string;
  fileSizeBytes: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
}

export interface RefundStatusHistory {
  id: number;
  fromStatus: RefundStatus | null;
  toStatus: RefundStatus;
  changedByName: string;
  changedByRole: string;
  changedAt: string;
  changeReason: string | null;
}

export interface RefundSummary {
  id: number;
  refundReferenceNo: string;
  tin: string;
  taxpayerName: string;
  refundType: RefundType;
  fiscalYearName: string;
  claimedRefundAmount: number;
  verifiedRefundAmount: number | null;
  approvedRefundAmount: number | null;
  status: RefundStatus;
  riskLevel: RiskLevel | null;
  isFlaggedForAudit: boolean;
  submittedAt: string | null;
  updatedAt?: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  documentCount: number;
}

export interface RefundDetail extends RefundSummary {
  totalTaxPaid: number;
  totalTaxLiability: number;
  sources: RefundSource[];
  bankDetails: BankDetails;
  documents: RefundDocument[];
  statusHistory: RefundStatusHistory[];
  rejectionReasonCode: string | null;
  rejectionReasonText: string | null;
  officerNotes: string | null;
  supervisorNotes: string | null;
  appealReferenceNo: string | null;
  courtOrderNo: string | null;
  bankValidated: boolean;
  itrRecordId: number | null;
}

export interface RefundCalculation {
  totalTaxPaid: number;
  totalTaxLiability: number;
  previouslyClaimed: number;
  eligibleRefundAmount: number;
  calculationBasis: string;
}

export interface EligibleSourceRecord {
  id: number;
  reference: string;
  periodLabel: string;
  taxPaid: number;
  taxLiability: number;
  excessAmount: number;
  fiscalYear: string;
}

export interface RefundFilterRequest {
  status?: string;
  refundType?: string;
  fiscalYearId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateRefundRequest {
  refundType: RefundType;
  fiscalYearId: number;
  sources: { sourceType: string; sourceRecordId: number; sourceAmount: number }[];
  requestedAmount: number;
  bankDetails: BankDetails;
  appealReferenceNo?: string;
  courtOrderNo?: string;
}

export interface RespondRequest {
  responseText: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RefundService {

  constructor(private http: HttpClient) {}

  // ── Taxpayer APIs ──────────────────────────────────────────────────────────

  getMyRefunds(filter: RefundFilterRequest): Observable<PagedResponse<RefundSummary>> {
    let params = new HttpParams()
      .set('page',    filter.page    ?? 0)
      .set('size',    filter.size    ?? 10)
      .set('sortBy',  filter.sortBy  ?? 'submittedAt')
      .set('sortDir', filter.sortDir ?? 'DESC');

    if (filter.status)       params = params.set('status',       filter.status);
    if (filter.refundType)   params = params.set('refundType',   filter.refundType);
    if (filter.fiscalYearId) params = params.set('fiscalYearId', filter.fiscalYearId);

    return this.http.get<PagedResponse<RefundSummary>>(
      API_ENDPOINTS.REFUNDS.MY, { params });
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

  respond(id: number, request: RespondRequest): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(API_ENDPOINTS.REFUNDS.RESPOND(id), request);
  }

  updateStatus(id: number, request: any): Observable<RefundDetail> {
    return this.http.patch<RefundDetail>(
      API_ENDPOINTS.REFUNDS.UPDATE_STATUS(id), request);
  }

  // ── Documents ──────────────────────────────────────────────────────────────

  uploadDocument(id: number, file: File, documentType: string): Observable<RefundDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<RefundDocument>(
      API_ENDPOINTS.REFUNDS.DOCUMENTS.UPLOAD(id), formData);
  }

  deleteDocument(refundId: number, docId: number): Observable<void> {
    return this.http.delete<void>(
      API_ENDPOINTS.REFUNDS.DOCUMENTS.DELETE(refundId, docId));
  }

  getDocumentDownloadUrl(refundId: number, docId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      API_ENDPOINTS.REFUNDS.DOCUMENTS.GET(refundId, docId));
  }

  getStatusHistory(id: number): Observable<RefundStatusHistory[]> {
    return this.http.get<RefundStatusHistory[]>(
      API_ENDPOINTS.REFUNDS.STATUS_HISTORY(id));
  }

  // ── Source eligibility ─────────────────────────────────────────────────────

  getEligibleItrSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(
      API_ENDPOINTS.REFUNDS.SOURCES.ITR);
  }

  getEligibleAitSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(
      API_ENDPOINTS.REFUNDS.SOURCES.AIT);
  }

  getEligibleVatSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(
      API_ENDPOINTS.REFUNDS.SOURCES.VAT);
  }

  getEligiblePaymentSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(
      API_ENDPOINTS.REFUNDS.SOURCES.PAYMENTS);
  }

  calculateRefund(
    sourceType: string,
    sourceRecordIds: number[]
  ): Observable<RefundCalculation> {
    return this.http.post<RefundCalculation>(
      API_ENDPOINTS.REFUNDS.CALCULATE,
      { sourceType, sourceRecordIds });
  }

  validateBankAccount(
    bankDetails: BankDetails
  ): Observable<{ valid: boolean; message: string }> {
    return this.http.post<{ valid: boolean; message: string }>(
      API_ENDPOINTS.REFUNDS.VALIDATE_BANK, bankDetails);
  }

  // ── Queue APIs ─────────────────────────────────────────────────────────────

  getOfficerQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.OFFICER);
  }

  getSupervisorQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.SUPERVISOR);
  }

  getFinanceQueue(): Observable<RefundSummary[]> {
    return this.http.get<RefundSummary[]>(API_ENDPOINTS.REFUNDS.QUEUE.FINANCE);
  }

  // ── Fiscal years ───────────────────────────────────────────────────────────

  getFiscalYears(): Observable<{ id: number; name: string; isCurrent: boolean }[]> {
    return this.http.get<{ id: number; name: string; isCurrent: boolean }[]>(
      API_ENDPOINTS.FISCAL_YEARS.ACTIVE);
  }
}
