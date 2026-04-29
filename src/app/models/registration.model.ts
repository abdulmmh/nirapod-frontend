// ── Wizard shared state ──────────────────────────────────────────────────────
// Passed as @Input to every step and updated via @Output events.

export type AccountType = 'Individual' | 'Company';

export interface RegistrationState {
  // Step 1
  accountType: AccountType | null;

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

  // Step 3 — Company
  companyName:       string;
  rjscNo:            string;
  incorporationDate: string;
  natureOfBusiness:  string;
  authorizedPersonName: string;
  authorizedPersonNid:  string;
}

export function emptyState(): RegistrationState {
  return {
    accountType: null,
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    nid: '', dateOfBirth: '', gender: '', profession: '',
    companyName: '', rjscNo: '', incorporationDate: '',
    natureOfBusiness: '', authorizedPersonName: '', authorizedPersonNid: '',
  };
}

// ── Backend payload ──────────────────────────────────────────────────────────
export interface UserRegistrationRequest {
  accountType:       AccountType;
  fullName:          string;
  email:             string;
  phone:             string;
  password:          string;

  // Individual
  nid?:              string;
  dateOfBirth?:      string;
  gender?:           string;
  profession?:       string;

  // Company
  companyName?:       string;
  rjscNo?:            string;
  incorporationDate?: string;
  natureOfBusiness?:  string;
  authorizedPersonName?: string;
  authorizedPersonNid?:  string;
}

// ── Backend success response ─────────────────────────────────────────────────
export interface RegistrationResponse {
  userId:      number;
  taxpayerId:  number;
  tinNumber:   string;
  fullName:    string;
  email:       string;
  accountType: AccountType;
  message:     string;
}