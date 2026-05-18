export type RefundStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed' | 'Cancelled';
export type RefundType   = 'VAT Refund' | 'Income Tax Refund' | 'Excess Payment' | 'Other';
export type RefundMethod = 'Bank Transfer' | 'Cheque' | 'Adjustment';

export interface ActivityLog {
  title: string;
  description?: string;
  date: string;
  type: 'filed' | 'assigned' | 'verified' | 'approved' | 'rejected' | 'completed' | 'default';
}

export interface Refund {
  id: number;
  refundNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  refundType: RefundType;
  refundMethod: RefundMethod;
  claimAmount: number;
  approvedAmount: number;
  paidAmount: number;
  returnNo: string;
  paymentRef: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  claimDate: string;
  approvalDate: string;
  paymentDate: string;
  status: RefundStatus;
  processedBy: string;
  approvedBy: string;
  remarks: string;
  activityLog?: ActivityLog[];
}

export interface RefundCreateRequest {
  taxpayerId: number | null;
  refundType: string;
  refundMethod: string;
  claimAmount: number;
  returnNo: string;
  paymentRef: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  claimDate: string;
  remarks: string;
}

export interface RefundListResponse {
  data: Refund[];
  total: number;
  page: number;
}
