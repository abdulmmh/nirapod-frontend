export type AuditStatus   = 'Scheduled' | 'In Progress' | 'Completed' | 'Flagged' | 'Cancelled' | 'Pending';
export type AuditType     = 'VAT Audit' | 'Income Tax Audit' | 'Full Audit' | 'Desk Audit' | 'Field Audit' | 'Special Audit';
export type AuditPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Audit {
  id: number;
  auditNo: string;
  taxpayerId: number;
  taxpayerName: string;   // read-only — resolved from server
  tinNumber: string;      // read-only — resolved from server
  auditType: AuditType;
  priority: AuditPriority;
  assessmentYear: string;
  returnNo: string;
  scheduledDate: string;
  startDate: string;
  completionDate: string;
  assignedTo: string;
  supervisedBy: string;
  auditFindings: string;
  taxDemand: number;
  penaltyRecommended: number;
  status: AuditStatus;
  remarks: string;
}

export interface AuditCreateRequest {
  taxpayerId: number | null;  // FK — required. No taxpayerName/tinNumber
  auditType: string;
  priority: string;
  assessmentYear: string;
  returnNo: string;
  scheduledDate: string;
  assignedTo: string;
  supervisedBy: string;
  remarks: string;
}

export interface AuditListResponse {
  data: Audit[];
  total: number;
  page: number;
}
