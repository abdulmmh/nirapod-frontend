export type FiscalYearStatus = 'Active' | 'Closed' | 'Upcoming';

export interface FiscalYear {
  id: number;
  yearName: string;
  startDate: string;
  endDate: string;
  vatDueDay: number;
  incomeTaxDueDate: string;
  isCurrentYear: boolean;
  status: FiscalYearStatus;
  createdAt: string;
}

export interface FiscalYearCreateRequest {
  yearName: string;
  startDate: string;
  endDate: string;
  vatDueDay: number;
  incomeTaxDueDate: string;
  isCurrentYear: boolean;
  status: string;
}