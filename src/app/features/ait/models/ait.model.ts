export type AitStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'PAID' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CREDITED' | 'CANCELLED';
export type DocumentRequestType = 'INFO' | 'MODIFICATION' | 'CLARIFICATION';

export interface AitRecord {
  id?: number;
  aitReferenceNo?: string;
  taxpayerId: number;
  taxpayerName?: string;
  importDutyRecordId: number;
  importDutyRefNo?: string;
  hsCode?: string;
  taxableValue: number;
  aitRate: number;
  calculatedAitAmount: number;
  approvedAitAmount?: number;
  status: AitStatus;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AitDetailResponse extends AitRecord {
  statusHistory: StatusHistoryEvent[];
  documents: AitDocument[];
  pendingRequests: DocumentRequest[];
}

export interface StatusHistoryEvent {
  id: number;
  fromStatus: AitStatus;
  toStatus: AitStatus;
  changedBy: string;
  changedAt: string;
  changeReason: string;
}

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

export interface CreateAitPayload {
  taxpayerId: number;
  importDutyRecordId: number;
  hsCode?: string;
  taxableValue: number;
  aitRate: number;
}

export interface ApproveAitPayload {
  approvedAmount?: number;
  approvalNotes?: string;
}

export interface RejectAitPayload {
  rejectionReason: string;
  feedbackForTaxpayer?: string;
}

export interface CreditAitPayload {
  creditAmount: number;
  creditDate: string;
}
