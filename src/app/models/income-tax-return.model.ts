
export type ITRCategory = 'Individual' | 'Company' | 'Partnership' | 'NGO';
export type ITRPeriod   = 'Annual' | 'Quarterly';
export type ITRStatus =
  'Draft' | 'Submitted' | 'Under Review' |
  'Accepted' | 'Rejected' | 'Overdue' |
  'Under Review' | 'Amended' | 'Send Back';

export interface IncomeTaxReturn {
  id: number;
  returnNo: string;
  tinNumber: string;
  taxpayerName: string;
  itrCategory: ITRCategory;
  assessmentYear: string;
  incomeYear: string;
  returnPeriod: ITRPeriod;
  grossIncome: number;
  exemptIncome: number;
  taxableIncome: number;
  taxRate: number;
  grossTax: number;
  taxRebate: number;
  netTaxPayable: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  taxPaid: number;
  refundable: number;
  submissionDate: string;
  dueDate: string;
  status: ITRStatus;
  submittedBy: string;
  verifiedBy: string;
  remarks: string;
  actionHistory?: ITRAction[];
}

export interface IncomeTaxReturnCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  itrCategory: string;
  assessmentYear: string;
  incomeYear: string;
  returnPeriod: string;
  grossIncome: number;
  exemptIncome: number;
  taxRate: number;
  grossTax: number;
  taxRebate: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  taxPaid: number;
  submissionDate: string;
  dueDate: string;
  submittedBy: string;
  remarks: string;
}

export interface ITRAction {
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  remarks: string;
  fromStatus: string;
  toStatus: string;
}
