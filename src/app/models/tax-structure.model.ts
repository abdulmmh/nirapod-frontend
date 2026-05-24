// ── Enums / Union Types ──────────────────────────────────────────────────────

export type TaxStructureStatus = 'Active' | 'Inactive' | 'Expired';
export type TaxType =
  | 'VAT'
  | 'AIT'
  | 'Import Duty'
  | 'Income Tax'
  | 'Excise Duty'
  | 'Supplementary Duty'
  | 'Other';
export type ApplicableTo =
  | 'All'
  | 'Individual'
  | 'Company'
  | 'Import'
  | 'Export'
  | 'Service'
  | 'Goods';
export type RateType = 'FLAT' | 'SLAB';

// ── Slab ─────────────────────────────────────────────────────────────────────

export interface TaxSlab {
  id?: number;
  minAmount: number;
  maxAmount?: number | null; // null = "no upper limit"
  rate: number;
  label?: string;
  sortOrder?: number;
}

// ── Core Entity ───────────────────────────────────────────────────────────────

export interface TaxStructure {
  id: number;
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  rateType: RateType;
  rate: number;
  slabs: TaxSlab[];
  applicableTo: ApplicableTo;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  status: TaxStructureStatus;
  createdBy: string;
  createdAt: string;
  updatedBy?: string; // null on first save
  updatedAt?: string; // null on first save
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface TaxStructureCreateRequest {
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  rateType: RateType;
  rate: number;
  slabs: TaxSlab[];
  applicableTo: ApplicableTo;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  status: TaxStructureStatus;
}

export interface TaxStructureUpdateRequest extends TaxStructureCreateRequest {}

// ── Master Data (served by GET /api/tax-structures/master-data) ───────────────

export interface TaxMasterData {
  taxTypes: string[];
  applicables: string[];
  statuses: string[];
  rateTypes: Array<{ value: RateType; label: string }>;
}

// ── Preview ───────────────────────────────────────────────────────────────────

export interface PreviewSlabBreakdown {
  slabMin: number;
  slabMax: number | null;
  slabRate: number;
  taxableInSlab: number;
  taxInSlab: number;
  label?: string;
}

export interface TaxPreviewResponse {
  taxableAmount: number;
  rateType: RateType;
  taxAmount: number;
  effectiveRate: number;
  breakdown: PreviewSlabBreakdown[];
}

// ── Ad-hoc Preview Request (Create page) ─────────────────────────────────────

export interface TaxPreviewRequest {
  amount: number;
  rateType: RateType;
  rate: number;
  slabs: TaxSlab[];
}
