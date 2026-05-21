// ─── audit-case.model.ts ────────────────────────────────────────────────────
export type AuditStatus =
  | 'SELECTED' | 'CASE_CREATED' | 'NOTICE_ISSUED' | 'UNDER_REVIEW'
  | 'DOCUMENT_REQUESTED' | 'RESPONSE_RECEIVED' | 'FINDINGS_RECORDED'
  | 'ASSESSMENT_PROPOSED' | 'SUPERVISOR_REVIEW' | 'ASSESSMENT_APPROVED'
  | 'DEMAND_ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'APPEALED'
  | 'CLOSED' | 'CANCELLED';

export type AuditType = 'DESK' | 'FIELD' | 'COMPREHENSIVE' | 'VAT' | 'REFUND' | 'SPECIAL';
export type TaxType   = 'INCOME_TAX' | 'VAT' | 'AIT';
export type Priority  = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface AuditStatusHistory {
  id: number;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedByRole: string;
  changedAt: string;
  changeReason: string;
}

export interface AuditCase {
  id: number;
  caseNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  auditType: string;
  taxType: string;
  fiscalYear: string;
  taxPeriodStart: string;
  taxPeriodEnd: string;
  triggerReason: string;
  riskScore: number;
  priority: string;
  status: AuditStatus;
  assignedOfficerId: number;
  assignedOfficerName: string;
  supervisorId: number;
  supervisorName: string;
  scheduledDate: string;
  dueDate: string;
  closedDate: string;
  returnReference: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  queryCount: number;
  openQueryCount: number;
  findingCount: number;
  documentRequestCount: number;
  hasAssessment: boolean;
  hasDemandNotice: boolean;
  statusHistory: AuditStatusHistory[];
}

export interface AuditCaseCreateRequest {
  taxpayerId: number;
  auditType: string;
  taxType: string;
  triggerReason: string;
  fiscalYear?: string;
  taxPeriodStart?: string;
  taxPeriodEnd?: string;
  riskScore?: number;
  priority?: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  supervisorId?: number;
  supervisorName?: string;
  scheduledDate?: string;
  dueDate?: string;
  returnReference?: string;
  remarks?: string;
}

export interface AuditFinding {
  id: number;
  auditCaseId: number;
  findingNo: string;
  findingType: string;
  description: string;
  legalBasis: string;
  declaredAmount: number;
  assessedAmount: number;
  varianceAmount: number;
  additionalTax: number;
  recordedBy: string;
  recordedAt: string;
  status: string;
  createdAt: string;
}

export interface AuditFindingRequest {
  findingType: string;
  description: string;
  legalBasis?: string;
  declaredAmount?: number;
  assessedAmount?: number;
  additionalTax?: number;
  status?: string;
}

export interface AuditQuery {
  id: number;
  auditCaseId: number;
  queryNo: string;
  subject: string;
  queryText: string;
  queryType: string;
  raisedBy: string;
  raisedAt: string;
  responseText: string;
  respondedBy: string;
  respondedAt: string;
  deadline: string;
  status: string;
}

export interface AuditDocumentRequest {
  id: number;
  auditCaseId: number;
  requestNo: string;
  requestedDocuments: string;
  requestReason: string;
  requestType: string;
  requestedBy: string;
  requestedAt: string;
  deadline: string;
  status: string;
  fulfillmentNotes: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── assessment.model.ts ─────────────────────────────────────────────────────
export interface Assessment {
  id: number;
  auditCaseId: number;
  caseNo: string;
  assessmentNo: string;
  taxpayerId: number;
  tinNumber: string;
  taxpayerName: string;
  fiscalYear: string;
  taxType: string;
  declaredIncome: number;
  assessedIncome: number;
  declaredTax: number;
  assessedTax: number;
  additionalTax: number;
  penaltyRate: number;
  penaltyAmount: number;
  interestRate: number;
  interestMonths: number;
  interestAmount: number;
  totalDemand: number;
  amountPaid: number;
  balanceDue: number;
  findingsSummary: string;
  legalBasis: string;
  appealRights: string;
  paymentDeadline: string;
  status: string;
  proposedBy: string;
  proposedAt: string;
  approvedBy: string;
  approvedAt: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
  hasDemandNotice: boolean;
  demandNo: string;
}

export interface AssessmentProposeRequest {
  declaredIncome?: number;
  assessedIncome?: number;
  declaredTax?: number;
  assessedTax?: number;
  additionalTax?: number;
  penaltyRate?: number;
  penaltyAmount?: number;
  interestRate?: number;
  interestMonths?: number;
  interestAmount?: number;
  findingsSummary?: string;
  legalBasis?: string;
  appealRights?: string;
  paymentDeadline?: string;
}

export interface DemandNotice {
  id: number;
  demandNo: string;
  assessmentId: number;
  assessmentNo: string;
  auditCaseId: number;
  taxpayerId: number;
  tinNumber: string;
  taxpayerName: string;
  amountDue: number;
  dueDate: string;
  paymentInstructions: string;
  issuedBy: string;
  issuedAt: string;
  status: string;
  paymentReference: string;
  paidAmount: number;
  paidAt: string;
  createdAt: string;
}
