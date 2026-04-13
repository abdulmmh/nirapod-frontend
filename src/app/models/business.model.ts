// ── Division & District (object form from API) ──
export interface DivisionObj {
  id: number;
  name: string;
  districts?: DistrictObj[];
}

export interface DistrictObj {
  id: number;
  name: string;
}

// ── Dropdown types ──
export interface BusinessType {
  id: number;
  typeName: string;
}

export interface BusinessCategory {
  id: number;
  categoryName: string;
}

// ── Main Business model ──
export interface Business {
  id: number;
  businessRegNo: string;
  businessName: string;
  tinNumber: string;
  binNo?: string;
  ownerName: string;
  businessType: string;       // comes as "2" from backend
  businessCategory: string;
  tradeLicenseNo: string;
  email?: string;
  phone: string;
  address?: string;
  status: string;
  annualTurnover?: number;
  numberOfEmployees?: number;
  incorporationDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  remarks?: string;
  createdAt?: string;

  // Taxpayer (now included in GET response after Bug 1 fix)
  taxpayer?: { id: number; fullName?: string; tinNumber?: string };
  taxpayerId?: number;        // extracted from taxpayer.id for form use

  division?: DivisionObj;
  district?: DistrictObj;

  divisionId?: number;
  districtId?: number;
}

export interface BusinessCreateRequest {
  taxpayerId: number;
  businessName: string;
  tinNumber: string;
  ownerName: string;
  
  businessTypeId: number;      
  businessCategoryId: number;  
  
  tradeLicenseNo: string;
  binNo?: string;
  incorporationDate?: string;
  registrationDate: string;
  expiryDate?: string;
  email?: string;
  phone: string;
  address: string;
  districtId: number;          
  divisionId: number;          
  annualTurnover: number;
  numberOfEmployees: number;
  remarks: string;
}


export const BUSINESS_TYPE_MAP: Record<string, string> = {
  '1': 'Sole Proprietorship',
  '2': 'Private Limited',
  '3': 'Public Limited',
  '4': 'Partnership',
  '5': 'NGO',
  '6': 'Other',
};