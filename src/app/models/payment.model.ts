export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
export type PaymentType   = 'VAT' | 'Income Tax' | 'Penalty' | 'Other';
export type PaymentMethod = 'Bank Transfer' | 'Online Banking' | 'Cheque' | 'Cash' | 'Mobile Banking';

export interface Payment {
  id:            number;
  transactionId: string;
  tinNumber:     string;
  taxpayerName:  string;
  taxpayerId?:   number;
  paymentType:   PaymentType;
  paymentMethod: PaymentMethod;
  amount:        number;
  bankName:      string;
  bankBranch:    string;
  accountNo:     string;
  chequeNo:      string;
  paymentDate:   string;
  valueDate:     string;
  referenceNo:   string;
  returnNo:      string;
  status:        PaymentStatus;
  processedBy:   string;
  remarks:       string;
  createdAt:     string;
}

export interface PaymentCreateRequest {
  taxpayerId?:   number;
  tinNumber:     string;
  taxpayerName:  string;
  paymentType:   string;
  paymentMethod: string;
  amount:        number;
  bankName:      string;
  bankBranch:    string;
  accountNo:     string;
  chequeNo:      string;
  paymentDate:   string;
  valueDate:     string;
  referenceNo:   string;
  returnNo:      string;
  remarks:       string;
}

// Used for PATCH /payments/{id}/status
export interface PaymentStatusUpdate {
  status:   string;
  remarks?: string;
}