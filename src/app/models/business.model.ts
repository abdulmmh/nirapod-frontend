export type BusinessStatus   = 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Dissolved';
export type BusinessType     = 'Sole Proprietorship' | 'Partnership' | 'Private Limited' | 'Public Limited' | 'NGO' | 'Other';
export type BusinessCategory = 'Manufacturing' | 'Trading' | 'Service' | 'Agriculture' | 'Construction' | 'IT' | 'Healthcare' | 'Education' | 'Other';

export interface Business {
  id: number;
  businessRegNo: string;
  businessName: string;
  tinNumber: string;
  ownerName: string;
  businessType: BusinessType;
  businessCategory: BusinessCategory;
  tradeLicenseNo: string;
  binNo: string;
  incorporationDate: string;
  registrationDate: string;
  expiryDate: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  annualTurnover: number;
  numberOfEmployees: number;
  status: BusinessStatus;
  remarks: string;
}

export interface BusinessCreateRequest {
  businessName: string;
  tinNumber: string;
  ownerName: string;
  businessType: string;
  businessCategory: string;
  tradeLicenseNo: string;
  binNo: string;
  incorporationDate: string;
  registrationDate: string;
  expiryDate: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  annualTurnover: number;
  numberOfEmployees: number;
  remarks: string;
}

export interface BusinessListResponse {
  data: Business[];
  total: number;
  page: number;
}