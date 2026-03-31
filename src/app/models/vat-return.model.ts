export interface VatReturn {
  id: number;
  returnNo: string;
  tinNumber: string;
  taxpayerName: string;
  binNumber: string;
  taxPeriod: string;
  periodFrom: string;
  periodTo: string;
  submissionDate: string;
  totalSales: number;
  totalPurchases: number;
  vatOnSales: number;
  vatOnPurchases: number;
  netVatPayable: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  returnStatus: 'Submitted' | 'Approved' | 'Rejected' | 'Pending' | 'Under Review';
  submittedBy: string;
  remarks: string;
}

export interface VatReturnCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  binNumber: string;
  taxPeriod: string;
  periodFrom: string;
  periodTo: string;
  submissionDate: string;
  totalSales: number;
  totalPurchases: number;
  vatOnSales: number;
  vatOnPurchases: number;
  netVatPayable: number;
  paymentStatus: string;
  remarks: string;
}

export interface VatReturnListResponse {
  data: VatReturn[];
  total: number;
  page: number;
}