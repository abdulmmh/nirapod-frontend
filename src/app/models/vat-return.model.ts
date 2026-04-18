export type VatReturnStatus =
  'Draft' | 'Submitted' | 'Under Review' |
  'Accepted' | 'Rejected' | 'Overdue' |
  'Amended' | 'Send Back';

export type VatReturnPeriod = 'Monthly' | 'Quarterly' | 'Annually';

export interface VatReturnAction {
  action:      string;
  performedBy: string;
  role:        string;
  timestamp:   string;
  remarks:     string;
  fromStatus:  string;
  toStatus:    string;
}

// ── Read (backend response) ──────────────────────────────────────────────────
export interface VatReturn {
  id:                 number;
  returnNo:           string;
  binNo:              string;
  tinNumber:          string;
  businessName:       string;
  returnPeriod:       VatReturnPeriod;
  periodMonth:        string;
  periodYear:         string;
  taxableSupplies:    number;
  exemptSupplies:     number;
  zeroRatedSupplies:  number;
  totalSupplies:      number;   // auto-calculated by backend
  outputTax:          number;
  inputTax:           number;
  netTaxPayable:      number;   // auto-calculated by backend
  taxPaid:            number;
  submissionDate:     string;
  dueDate:            string;
  assessmentYear:     string;
  status:             VatReturnStatus;
  submittedBy:        string;
  remarks:            string;
  actionHistory?:     VatReturnAction[];
}

// ── Create/Update (Angular → Backend) ────────────────────────────────────────
export interface VatReturnCreateRequest {
  vatRegistrationId:  number;   // @Transient FK — backend resolves to VatRegistration
  returnPeriod:       string;
  periodMonth:        string;
  periodYear:         string;
  taxableSupplies:    number;
  exemptSupplies:     number;
  zeroRatedSupplies:  number;
  outputTax:          number;
  inputTax:           number;
  taxPaid:            number;
  submissionDate:     string;
  dueDate:            string;
  assessmentYear:     string;
  submittedBy:        string;
  remarks:            string;
  // totalSupplies & netTaxPayable are NOT sent — auto-calculated in Service
}
