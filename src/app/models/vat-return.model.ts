// export type VatReturnStatus = 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'Overdue' | 'Amended';
// export type VatReturnPeriod = 'Monthly' | 'Quarterly' | 'Annually';

// export interface VatReturn {
//   id: number;
//   returnNo: string;
//   binNo: string;
//   tinNumber: string;
//   businessName: string;
//   returnPeriod: VatReturnPeriod;
//   periodMonth: string;
//   periodYear: string;
//   taxableSupplies: number;
//   exemptSupplies: number;
//   zeroRatedSupplies: number;
//   totalSupplies: number;
//   outputTax: number;
//   inputTax: number;
//   netTaxPayable: number;
//   taxPaid: number;
//   submissionDate: string;
//   dueDate: string;
//   assessmentYear: string;
//   status: VatReturnStatus;
//   submittedBy: string;
//   remarks: string;
// }

// export interface VatReturnCreateRequest {
//   binNo: string;
//   tinNumber: string;
//   businessName: string;
//   returnPeriod: string;
//   periodMonth: string;
//   periodYear: string;
//   taxableSupplies: number;
//   exemptSupplies: number;
//   zeroRatedSupplies: number;
//   outputTax: number;
//   inputTax: number;
//   taxPaid: number;
//   submissionDate: string;
//   dueDate: string;
//   assessmentYear: string;
//   submittedBy: string;
//   remarks: string;
// }

export type VatReturnStatus =
  'Draft' | 'Submitted' | 'Under Review' |
  'Accepted' | 'Rejected' | 'Overdue' |
  'Amended' | 'Send Back';
  
export type VatReturnPeriod = 'Monthly' | 'Quarterly' | 'Annually';

export interface VatReturnAction {
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  remarks: string;
  fromStatus: string;
  toStatus: string;
}

export interface VatReturn {
  id: number;
  returnNo: string;
  binNo: string;
  tinNumber: string;
  businessName: string;
  returnPeriod: VatReturnPeriod;
  periodMonth: string;
  periodYear: string;
  taxableSupplies: number;
  exemptSupplies: number;
  zeroRatedSupplies: number;
  totalSupplies: number;
  outputTax: number;
  inputTax: number;
  netTaxPayable: number;
  taxPaid: number;
  submissionDate: string;
  dueDate: string;
  assessmentYear: string;
  status: VatReturnStatus;
  submittedBy: string;
  remarks: string;
  actionHistory?: VatReturnAction[];  // ← new
}

export interface VatReturnCreateRequest {
  binNo: string;
  tinNumber: string;
  businessName: string;
  returnPeriod: string;
  periodMonth: string;
  periodYear: string;
  taxableSupplies: number;
  exemptSupplies: number;
  zeroRatedSupplies: number;
  outputTax: number;
  inputTax: number;
  taxPaid: number;
  submissionDate: string;
  dueDate: string;
  assessmentYear: string;
  submittedBy: string;
  remarks: string;
}