export type ITRStatus   = 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'Overdue' | 'Under Review' | 'Amended';
export type ITRCategory = 'Individual' | 'Company' | 'Partnership' | 'NGO';
export type ITRPeriod   = 'Annual' | 'Quarterly';

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