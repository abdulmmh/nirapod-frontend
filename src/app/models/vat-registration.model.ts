export type VatStatus   = 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Cancelled';
export type VatCategory = 'Standard' | 'Zero Rated' | 'Exempt' | 'Special';

export interface VatRegistration {
  id: number;
  binNo: string;
  tinNumber: string;
  businessName: string;
  ownerName: string;
  vatCategory: VatCategory;
  businessType: string;
  businessCategory: string;
  tradeLicenseNo: string;
  registrationDate: string;
  effectiveDate: string;
  expiryDate: string;
  annualTurnover: number;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  vatZone: string;
  vatCircle: string;
  status: VatStatus;
  remarks: string;
}

export interface VatRegistrationCreateRequest {
  tinNumber: string;
  businessName: string;
  ownerName: string;
  vatCategory: string;
  businessType: string;
  businessCategory: string;
  tradeLicenseNo: string;
  registrationDate: string;
  effectiveDate: string;
  expiryDate: string;
  annualTurnover: number;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  vatZone: string;
  vatCircle: string;
  remarks: string;
}