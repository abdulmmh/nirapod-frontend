export type AitStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING'
  | 'PAID'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CREDITED'
  | 'CANCELLED';

export type AitSourceType =
  | 'IMPORT'
  | 'SUPPLIER'
  | 'SALARY'
  | 'CONTRACTOR'
  | 'RENT';

export type DocumentRequestType = 'INFO' | 'MODIFICATION' | 'CLARIFICATION';

// ── Core record (list view) ───────────────────────────────────────────────────

export interface AitRecord {
  id?: number;
  aitReferenceNo?: string;

  // Taxpayer
  taxpayerId: number;
  taxpayerName?: string;
  taxpayerTin?: string;  

  // Fiscal year
  fiscalYearId?: number;
  fiscalYearName?: string;

  // Source
  sourceType: AitSourceType;
  importDutyRecordId?: number;
  hsCode?: string;
  deductorName?: string;
  deductorTin?: string;

  // Financials
  taxableValue: number;
  aitRate: number;
  calculatedAitAmount: number;
  approvedAitAmount?: number;

  // Challan
  challanNumber?: string;
  bankName?: string;
  challanVerified?: boolean;
  challanVerifiedBy?:string;

  // Workflow
  status: AitStatus;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  rejectionReason?: string;
  approvalNotes?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ── Detail response ───────────────────────

export interface AitDetailResponse extends AitRecord {
  statusHistory: StatusHistoryEvent[];
  documents: AitDocument[];
  pendingRequests: DocumentRequest[];
}

// ── Status history ────────────────────────────────────────────────────────────

export interface StatusHistoryEvent {
  id: number;
  fromStatus: AitStatus | null;
  toStatus: AitStatus;
  changedBy: string;
  changedAt: string;
  changeReason: string;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export interface AitDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DocumentRequest {
  id: number;
  requestType: DocumentRequestType;
  requestedDocuments: string;
  requestReason: string;
  requestedBy: string;
  deadline: string;
  status: 'PENDING' | 'FULFILLED' | 'OVERDUE';
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface CreateAitPayload {
  taxpayerId: number;
  sourceType: AitSourceType;
  importDutyRecordId?: number;
  hsCode?: string;
  deductorName?: string;
  deductorTin?: string;
  taxableValue: number;
  aitRate: number;
}

export interface SubmitAitPayload {
  attachmentIds: number[];
}

export interface ChallanVerifyPayload {
  challanNumber: string;
  bankName: string;
}

export interface ApproveAitPayload {
  approvedAmount?: number;
  approvalNotes?: string;
}

export interface RejectAitPayload {
  rejectionReason: string;
  feedbackForTaxpayer?: string;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

export const AIT_SOURCE_LABELS: Record<AitSourceType, string> = {
  IMPORT:     'Import Duty',
  SUPPLIER:   'Supplier Payment',
  SALARY:     'Salary Deduction',
  CONTRACTOR: 'Contractor Payment',
  RENT:       'Rent Payment',
};

export const AIT_STATUS_LABELS: Record<AitStatus, string> = {
  DRAFT:        'Draft',
  SUBMITTED:    'Submitted',
  PENDING:      'Pending Review',
  PAID:         'Paid',
  UNDER_REVIEW: 'Under Review',
  APPROVED:     'Approved',
  REJECTED:     'Rejected',
  CREDITED:     'Credited to ITR',
  CANCELLED:    'Cancelled',
};

export const AIT_STATUS_CLASSES: Record<AitStatus, string> = {
  DRAFT:        'status-draft',
  SUBMITTED:    'status-submitted',
  PENDING:      'status-pending',
  PAID:         'status-paid',
  UNDER_REVIEW: 'status-review',
  APPROVED:     'status-approved',
  REJECTED:     'status-rejected',
  CREDITED:     'status-credited',
  CANCELLED:    'status-cancelled',
};
