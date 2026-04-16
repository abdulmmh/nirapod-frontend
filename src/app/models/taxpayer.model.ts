import { TaxpayerType } from "./master-data.model";

export type TaxpayerStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

export interface Address {
  houseNo?: string;
  roadVillage?: string;
  ward?: string;
  thana: string;
  district: string;
  division: string;
  postalCode?: string;
}


export interface Taxpayer {
  id?: number;
  tinNumber?: string;
  taxpayerType: TaxpayerType;
  
  // Individual fields
  fullName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  fathersName?: string;
  mothersName?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nid?: string;
  dateOfBirth?: string;
  profession?: string;
  
  // Company fields
  companyName?: string;
  companySubType?: string; 
  incorporationDate?: string;
  tradeLicenseNo?: string;
  rjscNo?: string;
  natureOfBusiness?: string;

  // Authorized Person Info
  authorizedPersonName?: string;
  authorizedPersonNid?: string;
  authorizedPersonDesignation?: string;

  // Contact & Address
  email: string;
  phone: string;
  presentAddress: Address;
  permanentAddress: Address;
  sameAsPermanent: boolean;

  status: TaxpayerStatus;
  registrationDate: string;
}

export interface TaxpayerCreateRequest extends Omit<Taxpayer, 'id' | 'tinNumber'> {}