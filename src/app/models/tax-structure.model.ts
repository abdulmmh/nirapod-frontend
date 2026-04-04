export type TaxStructureStatus = 'Active' | 'Inactive' | 'Expired';
export type TaxType = 'VAT' | 'AIT' | 'Import Duty' | 'Income Tax' | 'Excise Duty' | 'Supplementary Duty' | 'Other';
export type ApplicableTo = 'All' | 'Individual' | 'Company' | 'Import' | 'Export' | 'Service' | 'Goods';

export interface TaxStructure {
  id: number;
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  rate: number;
  applicableTo: ApplicableTo;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  status: TaxStructureStatus;
  createdBy: string;
  createdAt: string;
}

export interface TaxStructureCreateRequest {
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  rate: number;
  applicableTo: ApplicableTo;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  status: TaxStructureStatus;
}