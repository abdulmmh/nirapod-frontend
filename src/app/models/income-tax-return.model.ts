export type ITReturnStatus = 'Submitted' | 'Approved' | 'Rejected' | 'Pending' | 'Under Review';
export type ITPaymentStatus = 'Paid' | 'Unpaid' | 'Partial';
export type ITAssessmentYear = string;

export interface IncomeTaxReturn {
  id: number;
  returnNo: string;
  tinNumber: string;
  taxpayerName: string;
  assessmentYear: string;
  incomeYear: string;
  submissionDate: string;

  // Income Sources
  salaryIncome: number;
  businessIncome: number;
  housePropertyIncome: number;
  capitalGainIncome: number;
  otherIncome: number;
  totalIncome: number;

  // Tax Calculation
  taxableIncome: number;
  grossTax: number;
  taxRebate: number;
  netTaxPayable: number;
  taxPaid: number;
  taxRefundable: number;

  paymentStatus: ITPaymentStatus;
  returnStatus: ITReturnStatus;
  submittedBy: string;
  remarks: string;
}

export interface IncomeTaxReturnCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  assessmentYear: string;
  incomeYear: string;
  submissionDate: string;

  salaryIncome: number;
  businessIncome: number;
  housePropertyIncome: number;
  capitalGainIncome: number;
  otherIncome: number;

  taxRebate: number;
  taxPaid: number;
  paymentStatus: string;
  remarks: string;
}

export interface IncomeTaxReturnListResponse {
  data: IncomeTaxReturn[];
  total: number;
  page: number;
}