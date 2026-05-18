export type CertificateType = 'TIN' | 'BIN' | 'TAX_CLEARANCE' | 'RETURN_ACK';

export interface Certificate {
  id:              number;
  certificateNo:   string;
  type:            CertificateType;
  holderName:      string;
  referenceNo:     string;
  issuedDate:      string;
  expiryDate?:     string;
  status:          string;
  taxZone?:        string;
  taxCircle?:      string;
  assessmentYear?: string;
  sourceId:        number;
}

export interface TaxClearanceCreateRequest {
  taxpayerId:     number;
  assessmentYear: string;
  issuedDate?:    string;
  validUntil?:    string;
  remarks?:       string;
}

export interface PublicVerifyResult {
  valid:           boolean;
  certificateNo?:  string;
  taxpayerName?:   string;
  tinNumber?:      string;
  assessmentYear?: string;
  issuedDate?:     string;
  validUntil?:     string;
  status?:         string;
  message?:        string;
}