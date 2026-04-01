// export type TaxpayerStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';
// export type TaxpayerType   = 'Individual' | 'Business' | 'Company';

// export interface Taxpayer {
//   id: number;
//   tin: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   taxpayerType: TaxpayerType;
//   nationalId: string;
//   dateOfBirth: string;
//   address: string;
//   status: TaxpayerStatus;
//   registrationDate: string;
// }

// export interface TaxpayerCreateRequest {
//   tin: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   taxpayerType: string;
//   nationalId: string;
//   dateOfBirth: string;
//   address: string;
//   status: string;
//   registrationDate: string;
// }

// export interface TaxpayerListResponse {
//   data: Taxpayer[];
//   total: number;
//   page: number;
// }


export type TaxpayerStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';
export type TaxpayerType = 'Individual' | 'Business' | 'Company';

export interface Taxpayer {
  id: number;
  tin: string;
  fullName: string;
  email: string;
  phone: string;
  taxpayerType: TaxpayerType;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  status: TaxpayerStatus;
  registrationDate: string;
}

export interface TaxpayerCreateRequest {
  tin: string;
  fullName: string;
  email: string;
  phone: string;
  taxpayerType: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  status: string;
  registrationDate: string;
}