export type AitStatus     = 'Draft' | 'Deducted' | 'Deposited' | 'Credited' | 'Disputed';
export type AitSourceType = 'Salary' | 'Import' | 'Contract' | 'Interest' | 'Dividend' | 'Commission' | 'Export';

export interface Ait {
  id: number;
  aitRef: string;
  tinNumber: string;
  taxpayerName: string;
  sourceType: AitSourceType;
  taxStructureId: number;
  grossAmount: number;
  aitRate: number;
  aitAmount: number;
  deductionDate: string;
  depositDate: string;
  deductedBy: string;
  fiscalYear: string;
  status: AitStatus;
  remarks: string;
}

export interface AitCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  sourceType: string;
  taxStructureId: number;
  grossAmount: number;
  aitRate: number;
  deductionDate: string;
  fiscalYear: string;
  deductedBy: string;
  status: string;
  remarks: string;
}