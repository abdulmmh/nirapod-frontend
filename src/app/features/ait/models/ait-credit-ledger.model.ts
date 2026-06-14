
export type CreditLedgerStatus =
  | 'AVAILABLE'
  | 'PARTIALLY_USED'
  | 'FULLY_USED'
  | 'EXPIRED';

export interface AitCreditLedger {
  id: number;
  ledgerReferenceNo: string;

  // Taxpayer
  taxpayerId: number;
  taxpayerName: string;
  taxpayerTin: string;

  // Fiscal year
  fiscalYearId: number;
  fiscalYearName: string;

  // AIT record link
  aitRecordId: number;
  aitReferenceNo: string;
  sourceType: string;

  // ITR link (null until applied)
  appliedItrId?: number;
  appliedItrReturnNo?: string;

  // Financials
  creditedAmount: number;
  usedAmount: number;
  remainingAmount: number;

  // Workflow
  status: CreditLedgerStatus;
  creditedAt?: string;
  creditDate?: string;
  appliedDate?: string;
  expiryDate?: string;
  creditedBy?: string;
  appliedBy?: string;
  remarks?: string;
  notes?: string;
  applications?: CreditApplication[];

  createdAt: string;
}

export interface AvailableCreditSummary {
    ledgerId:        number;
    aitReferenceNo:  string;
    sourceType:      string;
    fiscalYearName:  string;
    creditedAmount:  number;   
    usedAmount:      number;   
    remainingAmount: number;
    creditedAt?:     string;
}

export interface CreditApplication {
  id: number;
  ledgerId: number;
  itrId: number;
  itrReturnNo?: string;
  appliedAmount: number;
  appliedAt: string;
  appliedBy: string;
  status?: string;
  reversalReason?: string;
}

export interface ApplyAitCreditPayload {
  itrId: number;
  credits: CreditItem[];  // ← backend expects list of items
}

export interface CreditItem {
  ledgerId: number;
  amountToApply: number;
}
export interface CreditRemainingSummary {
  taxpayerId: number;
  fiscalYearId: number;
  remaining: number;
}

export const CREDIT_STATUS_LABELS: Record<CreditLedgerStatus, string> = {
  AVAILABLE:       'Available',
  PARTIALLY_USED:  'Partially Used',
  FULLY_USED:      'Fully Used',
  EXPIRED:         'Expired',
};

export const CREDIT_STATUS_CLASSES: Record<CreditLedgerStatus, string> = {
  AVAILABLE:       'status-approved',
  PARTIALLY_USED:  'status-pending',
  FULLY_USED:      'status-credited',
  EXPIRED:         'status-cancelled',
};
