// export type BusinessStatus   = 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Dissolved';

// export interface BusinessType {
//   id: number;
//   typeName: string;
// }
// export interface BusinessCategory {
//   id: number;
//   categoryName: string;
// }


// export interface Business {
//   id: number;
//   taxpayerId: number;
//   taxpayerName?: string;
//   businessRegNo: string;
//   businessName: string;
//   tinNumber: string;
//   ownerName: string;
//   businessType: string;
//   businessCategory: string;
//   tradeLicenseNo: string;
//   binNo: string;
//   incorporationDate: string;
//   registrationDate: string;
//   expiryDate: string;
//   email: string;
//   phone: string;
//   address: string;

//   district: string;
//   division: string;
 
//   districtId?: number;
//   divisionId?: number;
//   annualTurnover: number;
//   numberOfEmployees: number;
//   status: BusinessStatus;
//   remarks: string;
// }

// export interface BusinessCreateRequest {
//   taxpayerId: number;
//   businessName: string;
//   tinNumber: string;
//   ownerName: string;
//   businessType: string;
//   businessCategory: string;
//   tradeLicenseNo: string;
//   binNo?: string;
//   incorporationDate?: string;
//   registrationDate: string;
//   expiryDate?: string;
//   email?: string;
//   phone: string;
//   address: string;
//   districtId: number;          
//   divisionId: number;          
//   annualTurnover: number;
//   numberOfEmployees: number;
//   remarks: string;
// }

// export interface BusinessListResponse {
//   data: Business[];
//   total: number;
//   page: number;
// }


// // export type BusinessStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Dissolved';

// // // Note: You can eventually remove these two if the frontend relies 100% on the backend for display names.
// // export type BusinessType     = 'Sole Proprietorship' | 'Partnership' | 'Private Limited' | 'Public Limited' | 'NGO' | 'Other';
// // export type BusinessCategory = 'Manufacturing' | 'Trading' | 'Service' | 'Agriculture' | 'Construction' | 'IT' | 'Healthcare' | 'Education' | 'Other';

// // export interface Business {
// //   id: number;
// //   taxpayerId: number;
// //   taxpayerName?: string;       
// //   businessRegNo: string;
// //   businessName: string;
// //   tinNumber: string;
// //   ownerName: string;


// //   businessType: string;
// //   businessCategory: string;
// //   district: string;            
// //   division: string; 


// //   businessTypeId?: number;
// //   businessCategoryId?: number;
// //   districtId?: number;
// //   divisionId?: number;
  
// //   tradeLicenseNo: string;
// //   binNo: string;
// //   incorporationDate: string;
// //   registrationDate: string;
// //   expiryDate: string;
// //   email: string;
// //   phone: string;
// //   address: string;
// //   annualTurnover: number;
// //   numberOfEmployees: number;
// //   status: BusinessStatus;
// //   remarks: string;
// // }


// // export interface BusinessListResponse {
// //   data: Business[];
// //   total: number;
// //   page: number;
// // }

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
  id: string;
  typeName: string;
}

export interface BusinessCategory {
  id: string;
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