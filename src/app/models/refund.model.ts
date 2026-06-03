
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

export interface BankDetails {
  bankName: string;
  bankBranch: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  mfsProvider?: string;
  mfsNumber?: string;
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

export interface RefundCalculation {
  totalTaxPaid: number;
  totalTaxLiability: number;
  previouslyClaimed: number;
  eligibleRefundAmount: number;
  calculationBasis: string;
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
  isFlaggedForAudit: boolean;
  submittedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  updatedAt: string | null;
  documentCount: number;
}

export interface RefundDetail extends RefundSummary {
  totalTaxPaid: number;
  totalTaxLiability: number;
  sources: any[];
  bankDetails: BankDetails;
  documents: any[];
  statusHistory: any[];
  rejectionReasonCode: string | null;
  rejectionReasonText: string | null;
  officerNotes: string | null;
  supervisorNotes: string | null;
  appealReferenceNo: string | null;
  courtOrderNo: string | null;
  bankValidated: boolean;
  itrRecordId: number | null;
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
  taxpayerId?: number; // ← Officer: set this; Taxpayer: omit
  sources: {
    sourceType: string;
    sourceRecordId: number;
    sourceAmount: number;
  }[];
  requestedAmount: number;
  bankDetails: BankDetails;
  appealReferenceNo?: string;
  courtOrderNo?: string;
}

export interface RespondRequest {
  responseText: string;
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

export interface RefundDocument {
  id: number;
  documentType: string;
  documentName: string;
  originalFilename: string;
  fileSizeBytes: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
}