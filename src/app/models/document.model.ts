export type DocumentStatus   = 'Pending' | 'Verified' | 'Rejected' | 'Expired' | 'Under Review';
export type DocumentType     = 'NID' | 'Trade License' | 'TIN Certificate' | 'BIN Certificate' | 'VAT Return' | 'Income Tax Return' | 'Bank Statement' | 'Audit Report' | 'Other';
export type DocumentCategory = 'Taxpayer' | 'Business' | 'Return' | 'Payment' | 'Legal' | 'Other';

export interface Document {
  id: number;
  documentNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  documentType: DocumentType;
  documentCategory: DocumentCategory;
  documentTitle: string;
  referenceNo: string;
  issueDate: string;
  expiryDate: string;
  submissionDate: string;
  verificationDate: string;
  fileSize: string;
  status: DocumentStatus;
  verifiedBy: string;
  remarks: string;
}

export interface DocumentCreateRequest {
  taxpayerId: number | null;
  documentType: string;
  documentCategory: string;
  documentTitle: string;
  referenceNo: string;
  issueDate: string;
  expiryDate: string;
  submissionDate: string;
  remarks: string;
}

export interface DocumentListResponse {
  data: Document[];
  total: number;
  page: number;
}
