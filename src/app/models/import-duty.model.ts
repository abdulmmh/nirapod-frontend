export type ImportDutyStatus = 'Draft' | 'Pending' | 'Assessed' | 'Paid' | 'Cleared' | 'Disputed';

export interface ImportDutyTaxPreview {
  cifValue: number;
  customsDuty: number;
  supplementaryDuty: number;
  vat: number;
  advanceIncomeTax: number;
  advanceTax: number;
  totalPayable: number;
  cdRate?: number;
  sdRate?: number;
  vatRate?: number;
  aitRate?: number;
  atRate?: number;
}

export interface ImportDuty {
  id: number;
  dutyRef: string;
  tinNumber: string;
  taxpayerName: string;
  businessName: string;
  productId?: number;
  productName: string;
  hsCode: string;
  goodsDescription: string;
  originCountry: string;
  cifValue: number;
  cdRate?: number;
  sdRate?: number;
  vatRate?: number;
  aitRate?: number;
  atRate?: number;
  customsDuty: number;
  supplementaryDuty: number;
  vat: number;
  advanceIncomeTax: number;
  advanceTax: number;
  totalPayable: number;
  paidAmount: number;
  portOfEntry: string;
  boeNumber: string;
  boeDate: string;
  billOfLading: string;
  importDate: string;
  assessmentDate: string;
  status: ImportDutyStatus;
  remarks: string;
}

export interface ImportDutyCreateRequest {
  tinNumber: string;
  taxpayerName: string;
  businessName: string;
  productId: number;
  goodsDescription: string;
  originCountry: string;
  cifValue: number;
  portOfEntry: string;
  boeNumber: string;
  boeDate: string;
  billOfLading: string;
  importDate: string;
  status: string;
  remarks: string;
}

export type ImportDutyUpdateRequest = ImportDutyCreateRequest;
