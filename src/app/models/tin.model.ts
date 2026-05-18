export type TinStatus =
  | 'Active' | 'Inactive' | 'Suspended' | 'Cancelled' | 'Pending';
export type TinCategory =
  | 'Individual' | 'Company' | 'Partnership' | 'NGO' | 'Government';

export interface Tin {
  id: number;
  tinNumber: string;
  taxpayerId: number;
  taxpayerName: string;
  tinCategory: TinCategory;
  nid: string;
  passportNo: string;
  dateOfBirth: string;
  gender: string;
  incorporationDate: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  taxZone: string;
  taxCircle: string;
  issuedDate: string;
  lastUpdated: string;
  status: TinStatus;
  remarks: string;
}

export interface TinCreateRequest {
  taxpayerId: number | null;
  tinCategory: string;
  nid: string;
  passportNo: string;
  dateOfBirth: string;
  gender: string;
  incorporationDate: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  taxZone: string;
  taxCircle: string;
  issuedDate: string;
  remarks: string;
}

export interface TinListResponse {
  data: Tin[];
  total: number;
  page: number;
}
