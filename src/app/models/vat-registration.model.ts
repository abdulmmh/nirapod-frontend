export type VatStatus   = 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Cancelled';
export type VatCategory = 'Standard' | 'Zero Rated' | 'Exempt' | 'Special';
export type ReturnPeriod = 'Monthly' | 'Quarterly';


export interface VatRegistration {
  id:               number;
  binNo:            string;
  tinNumber:        string;
  businessName:     string;
  ownerName:        string;
  vatCategory:      VatCategory;
  businessType:     string;
  businessCategory: string;
  tradeLicenseNo:   string;
  registrationDate: string;
  effectiveDate:    string;
  expiryDate:       string;
  annualTurnover:   number;
  email:            string;
  phone:            string;
  address:          string;
  district:         string;
  division:         string;
  vatZone:          string;
  vatCircle:        string;
  /** Persisted DB column (`zone_id`). Used in edit cascade restore. */
  zoneId:           number;
  status:           VatStatus;
  remarks:          string;
}


export interface VatRegistrationCreateRequest {
  // Foreign-key IDs resolved server-side
  taxpayerId:  number;
  businessId?: number | null;
  vatZoneId:   number;
  vatCircleId: number;
  districtId?: number | null;
  divisionId?: number | null;

  // VAT classification
  vatCategory:   VatCategory | string;
  returnPeriod?: ReturnPeriod;     // Monthly | Quarterly — backend addition needed

  // Dates
  registrationDate: string;
  effectiveDate?:   string;
  expiryDate?:      string;

  // Optional officer notes
  remarks?: string;
}