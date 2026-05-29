// ait-credit.model.ts
// Models for AIT Credit Ledger — Phase 2

export type CreditLedgerStatus =
  | 'AVAILABLE'
  | 'PARTIALLY_USED'
  | 'FULLY_USED'
  | 'EXPIRED';

export interface AitCreditLedger {
  id: number;
  taxpayerId: number;
  taxpayerName: string;
  taxpayerTin: string;
  fiscalYearId: number;
  fiscalYearName: string;
  aitRecordId: number;
  aitReferenceNo: string;
  sourceType: string;
  creditedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: CreditLedgerStatus;
  creditedBy: string;
  creditedAt: string;
  notes?: string;
  createdAt: string;
  applications?: CreditApplication[];
}

export interface CreditApplication {
  id: number;
  itrId: number;
  itrReturnNo: string;
  appliedAmount: number;
  status: 'APPLIED' | 'REVERSED';
  appliedBy: string;
  appliedAt: string;
  reversalReason?: string;
}

// Used on ITR filing form — summary view
export interface AvailableCreditSummary {
  ledgerId: number;
  aitReferenceNo: string;
  sourceType: string;
  fiscalYearName: string;
  remainingAmount: number;
  creditedAt: string;
}

// Request payloads
export interface ApplyAitCreditPayload {
  itrId: number;
  credits: CreditItem[];
}

export interface CreditItem {
  ledgerId: number;
  amountToApply: number;
}

// UI label helpers
export const CREDIT_STATUS_LABELS: Record<CreditLedgerStatus, string> = {
  AVAILABLE:      'Available',
  PARTIALLY_USED: 'Partially Used',
  FULLY_USED:     'Fully Used',
  EXPIRED:        'Expired',
};

export const CREDIT_STATUS_CLASSES: Record<CreditLedgerStatus, string> = {
  AVAILABLE:      'status-approved',
  PARTIALLY_USED: 'status-pending',
  FULLY_USED:     'status-credited',
  EXPIRED:        'status-cancelled',
};
