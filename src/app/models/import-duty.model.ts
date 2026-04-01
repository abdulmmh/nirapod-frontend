export type ImportDutyStatus = 'Draft' | 'Pending' | 'Assessed' | 'Paid' | 'Cleared' | 'Disputed';

export interface ImportDuty {
  id: number;
  dutyRef: string;
  tinNumber: string;
  taxpayerName: string;
  businessName: string;
  productName: string;
  hsCode: string;
  goodsDescription: string;
  originCountry: string;
  cifValue: number;
  dutyRate: number;
  dutyAmount: number;
  vatOnImport: number;
  totalPayable: number;
  paidAmount: number;
  portOfEntry: string;
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
  dutyRate: number;
  portOfEntry: string;
  billOfLading: string;
  importDate: string;
  status: string;
  remarks: string;
}