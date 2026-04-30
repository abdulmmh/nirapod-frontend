// ── Wizard shared state ──────────────────────────────────────────────────────

export type AccountCategory = 'Individual' | 'Business' | 'Organization';

export interface RegistrationState {
  // Step 1
  accountCategory:  AccountCategory | null;
  taxpayerTypeId:   number | null;
  taxpayerTypeName: string;

  // Step 2
  fullName:        string;
  email:           string;
  phone:           string;
  password:        string;
  confirmPassword: string;

  // Step 3 — Individual
  nid:         string;
  dateOfBirth: string;
  gender:      string;
  profession:  string;

  // Step 3 — Business / Organization
  companyName:          string;
  rjscNo:               string;
  incorporationDate:    string;
  natureOfBusiness:     string;
  authorizedPersonName: string;
  authorizedPersonNid:  string;
}

export function emptyState(): RegistrationState {
  return {
    accountCategory: null, taxpayerTypeId: null, taxpayerTypeName: '',
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    nid: '', dateOfBirth: '', gender: '', profession: '',
    companyName: '', rjscNo: '', incorporationDate: '',
    natureOfBusiness: '', authorizedPersonName: '', authorizedPersonNid: '',
  };
}

// ── Backend payload ──────────────────────────────────────────────────────────
export interface UserRegistrationRequest {
  taxpayerTypeId:  number;           // DB id — backend resolve করবে
  accountCategory: AccountCategory;  // "Individual" | "Business" | "Organization"
  fullName:        string;
  email:           string;
  phone:           string;
  password:        string;

  // Individual only
  nid?:         string;
  dateOfBirth?: string;
  gender?:      string;
  profession?:  string;

  // Business / Organization only
  companyName?:          string;
  rjscNo?:               string;    // Government Organization-এ optional
  incorporationDate?:    string;
  natureOfBusiness?:     string;
  authorizedPersonName?: string;
  authorizedPersonNid?:  string;
}

// ── Backend success response ─────────────────────────────────────────────────
export interface RegistrationResponse {
  userId:          number;
  taxpayerId:      number;
  tinNumber:       string;
  fullName:        string;
  email:           string;
  accountCategory: AccountCategory;   // ← accountType থেকে accountCategory
  taxpayerTypeName: string;           // ← নতুন — e.g. "Non-Resident Individual"
  message:         string;
}