// ait-credit-ledger.model.ts
// Add to: src/app/models/ait-credit-ledger.model.ts

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
  creditDate: string;
  appliedDate?: string;
  expiryDate?: string;
  creditedBy?: string;
  appliedBy?: string;
  remarks?: string;

  createdAt: string;
}

export interface ApplyAitCreditPayload {
  itrId: number;
  applyAmount?: number;
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
