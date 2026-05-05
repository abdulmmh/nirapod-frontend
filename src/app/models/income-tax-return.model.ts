export type ITRCategory = 'Individual' | 'Company' | 'Partnership' | 'NGO';
export type ITRPeriod = 'Annual' | 'Quarterly';
export type ITRStatus =
  | 'Draft'
  | 'Submitted'
  | 'Accepted'
  | 'Rejected'
  | 'Overdue'
  | 'Under Review'
  | 'Amended'
  | 'Send Back';

export interface IncomeTaxReturn {
  id: number;
  returnNo: string;
  tinNumber: string;
  taxpayerName: string;
  itrCategory: ITRCategory;
  companySubType: string;
  assessmentYear: string;
  incomeYear: string;
  returnPeriod: ITRPeriod;
  grossIncome: number;
  exemptIncome: number;
  taxableIncome?: number;
  taxRate: number;
  grossTax: number;
  taxRebate: number;
  netTaxPayable?: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  taxPaid: number;
  refundable?: number;
  submissionDate: string;
  dueDate: string;
  status: ITRStatus;
  submittedBy: string;
  verifiedBy?: string;
  remarks: string;
  taxpayer?: { id: number; tinNumber: string };
  actionHistory?: ITRAction[];
}

export interface IncomeTaxReturnCreateRequest {
  taxpayerId?: number;
  tinNumber: string;
  taxpayerName: string;
  itrCategory: ITRCategory;
  companySubType: string;
  assessmentYear: string;
  incomeYear: string;
  returnPeriod: ITRPeriod;
  grossIncome: number;
  exemptIncome: number;
  taxRebate: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  taxPaid: number;
  submissionDate: string;
  dueDate: string;
  submittedBy: string;
  remarks: string;
}

export interface IncomeTaxReturnUpdateRequest {
  grossIncome?: number;
  exemptIncome?: number;
  taxRebate?: number;
  advanceTaxPaid?: number;
  withholdingTax?: number;
  taxPaid?: number;
  companySubType?: string;
  remarks?: string;
}

export interface TaxPreviewRequest {
  grossIncome: number;
  exemptIncome: number;
  taxRebate: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  itrCategory: ITRCategory;
  companySubType: string;
}

export interface TaxPreviewResult {
  taxableIncome: number;
  effectiveRatePct: number;
  grossTax: number;
  netTaxPayable: number;
}

export interface ITRAction {
  id?: number;
  action: string;
  fromStatus: string;
  toStatus: string;
  status: string;
  performedBy: string;
  role: string;
  performedAt: string;
  remarks: string;
}

export interface ItrWizardState {
  taxpayerId: number | null;
  tinNumber: string;
  taxpayerName: string;
  itrCategory: ITRCategory;
  companySubType: string;
  assessmentYear: string;
  incomeYear: string;
  returnPeriod: ITRPeriod;
  dueDate: string;
  submittedBy: string;
  grossIncome: number;
  exemptIncome: number;
  taxRebate: number;
  advanceTaxPaid: number;
  withholdingTax: number;
  taxPaid: number;
  preview: TaxPreviewResult | null;
  remarks: string;
}

export function emptyWizardState(): ItrWizardState {
  return {
    taxpayerId: null,
    tinNumber: '',
    taxpayerName: '',
    itrCategory: 'Individual',
    companySubType: '',
    assessmentYear: '',
    incomeYear: '',
    returnPeriod: 'Annual',
    dueDate: '',
    submittedBy: '',
    grossIncome: 0,
    exemptIncome: 0,
    taxRebate: 0,
    advanceTaxPaid: 0,
    withholdingTax: 0,
    taxPaid: 0,
    preview: null,
    remarks: '',
  };
}
