import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class RefundService {
  private readonly base = `${environment.apiUrl}/refunds`;

  constructor(private http: HttpClient) {}

  // Taxpayer APIs
  getMyRefunds(filter: RefundFilterRequest): Observable<PagedResponse<RefundSummary>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 10)
      .set('sortBy', filter.sortBy ?? 'submittedAt')
      .set('sortDir', filter.sortDir ?? 'DESC');

    if (filter.status) params = params.set('status', filter.status);
    if (filter.refundType) params = params.set('refundType', filter.refundType);
    if (filter.fiscalYearId) params = params.set('fiscalYearId', filter.fiscalYearId);

    return this.http.get<PagedResponse<RefundSummary>>(`${this.base}/my`, { params });
  }

  getById(id: number): Observable<RefundDetail> {
    return this.http.get<RefundDetail>(`${this.base}/${id}`);
  }

  create(request: CreateRefundRequest): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(this.base, request);
  }

  update(id: number, request: CreateRefundRequest): Observable<RefundDetail> {
    return this.http.put<RefundDetail>(`${this.base}/${id}`, request);
  }

  submit(id: number): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(`${this.base}/${id}/submit`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  respond(id: number, request: RespondRequest): Observable<RefundDetail> {
    return this.http.post<RefundDetail>(`${this.base}/${id}/respond`, request);
  }

  uploadDocument(id: number, file: File, documentType: string): Observable<RefundDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<RefundDocument>(`${this.base}/${id}/documents`, formData);
  }

  deleteDocument(refundId: number, docId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${refundId}/documents/${docId}`);
  }

  getDocumentDownloadUrl(refundId: number, docId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.base}/${refundId}/documents/${docId}`);
  }

  getStatusHistory(id: number): Observable<RefundStatusHistory[]> {
    return this.http.get<RefundStatusHistory[]>(`${this.base}/${id}/status-history`);
  }

  // Source eligibility
  getEligibleItrSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(`${this.base}/sources/itr`);
  }

  getEligibleAitSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(`${this.base}/sources/ait`);
  }

  getEligibleVatSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(`${this.base}/sources/vat`);
  }

  getEligiblePaymentSources(): Observable<EligibleSourceRecord[]> {
    return this.http.get<EligibleSourceRecord[]>(`${this.base}/sources/payments`);
  }

  calculateRefund(
    sourceType: string,
    sourceRecordIds: number[]
  ): Observable<RefundCalculation> {
    return this.http.post<RefundCalculation>(`${this.base}/calculate`, {
      sourceType,
      sourceRecordIds,
    });
  }

  validateBankAccount(bankDetails: BankDetails): Observable<{ valid: boolean; message: string }> {
    return this.http.post<{ valid: boolean; message: string }>(
      `${this.base}/validate-bank`,
      bankDetails
    );
  }

  // Fiscal years (for dropdown)
  getFiscalYears(): Observable<{ id: number; name: string; isCurrent: boolean }[]> {
    return this.http.get<{ id: number; name: string; isCurrent: boolean }[]>(
      `${environment.apiUrl}/fiscal-years/active`
    );
  }
}
