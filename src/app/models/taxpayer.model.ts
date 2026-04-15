

export type TaxpayerStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

export interface TaxpayerType {
  id: number;
  typeName: string;
}

export interface Taxpayer {
  id: number;
  tinNumber: string;
  fullName: string;
  email: string;
  phone: string;
  taxpayerType: TaxpayerType;
  nid: string;
  dateOfBirth: string;
  address: string;
  status: TaxpayerStatus;
  registrationDate: string;
}

export interface TaxpayerCreateRequest {
  tinNumber: string;
  fullName: string;
  email: string;
  phone: string;
  taxpayerType: TaxpayerType;
  nid: string;
  dateOfBirth: string;
  address: string;
  status: TaxpayerStatus;
  registrationDate: string;
}