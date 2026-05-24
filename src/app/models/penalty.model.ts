export type PenaltyStatus =
  | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED'
  | 'PARTIALLY_PAID' | 'PAID' | 'APPEALED' | 'CANCELLED' | 'CLOSED'
  | 'Issued' | 'Pending' | 'Paid' | 'Waived' | 'Overdue';

export type PenaltyType =
  | 'Late Filing' | 'Late Payment' | 'Non-Compliance'
  | 'Fraud' | 'Underpayment' | 'Other';

export type PenaltySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PenaltyAuditLog {
  id: number;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedBy: string;
  performedByRole: string;
  remarks: string | null;
  createdAt: string;
}

export interface Penalty {
  id: number;
  penaltyNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  penaltyType: PenaltyType;
  severity: PenaltySeverity;
  penaltyAmount: number;
  interestAmount: number;
  interestRate: number;
  totalAmount: number;
  paidAmount: number;
  returnNo: string;
  assessmentYear: string;
  issueDate: string;
  dueDate: string;
  paymentDate: string | null;
  status: PenaltyStatus;
  issuedBy: string;
  approvedBy: string;
  description: string;
  remarks: string;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  issuedAt: string | null;
  auditLogs?: PenaltyAuditLog[];
}

export interface PenaltyCreateRequest {
  taxpayerId: number | null;
  penaltyType: string;
  severity: string;
  penaltyAmount: number;
  returnNo: string;
  assessmentYear: string;
  issueDate: string;
  dueDate: string;
  issuedBy: string;
  description: string;
  remarks: string;
}

export interface PenaltyStatusRequest {
  remarks: string;
}