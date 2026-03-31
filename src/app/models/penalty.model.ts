export type PenaltyStatus   = 'Issued' | 'Pending' | 'Paid' | 'Waived' | 'Appealed' | 'Overdue';
export type PenaltyType     = 'Late Filing' | 'Late Payment' | 'Non-Compliance' | 'Fraud' | 'Underpayment' | 'Other';
export type PenaltySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Penalty {
  id: number;
  penaltyNo: string;
  tinNumber: string;
  taxpayerName: string;
  penaltyType: PenaltyType;
  severity: PenaltySeverity;
  penaltyAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  returnNo: string;
  assessmentYear: string;
  issueDate: string;
  dueDate: string;
  paymentDate: string;
  status: PenaltyStatus;
  issuedBy: string;
  approvedBy: string;
  description: string;
  remarks: string;
}

export interface PenaltyCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  penaltyType: string;
  severity: string;
  penaltyAmount: number;
  interestAmount: number;
  returnNo: string;
  assessmentYear: string;
  issueDate: string;
  dueDate: string;
  issuedBy: string;
  description: string;
  remarks: string;
}

export interface PenaltyListResponse {
  data: Penalty[];
  total: number;
  page: number;
}