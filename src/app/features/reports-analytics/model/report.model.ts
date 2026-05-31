export interface KpiSummary {
  totalRevenue: number;
  vatCollected: number;
  incomeTaxCollected: number;
  importDutyCollected: number;
  aitDeducted: number;
  penaltyCollected: number;
  refundPaid: number;
  revenueGrowthPct: number;
  vatGrowthPct: number;
  itGrowthPct: number;
  importDutyGrowthPct: number;
  activeTaxpayers: number;
  filedReturns: number;
  complianceRate: number;
  fiscalYear: string;
  generatedAt: string;
}

export interface TrendPoint {
  label: string;  // e.g. "Jul 2024"
  vatAmount: number;
  itAmount: number;
  importDutyAmount: number;
  totalAmount: number;
}

export interface TaxBreakdown {
  taxType: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ZonePerformance {
  zoneName: string;
  totalCollection: number;
  targetAmount: number;
  achievementPct: number;
  taxpayerCount: number;
  filedCount: number;
}

export interface ComplianceData {
  zoneName: string;
  totalRegistered: number;
  filedCount: number;
  complianceRate: number;
}

export interface ReportFilter {
  fiscalYear: string;
  zone: string;
  circle: string;
  taxType: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportExportRequest {
  reportType: string;
  fiscalYear: string;
  zone?: string;
  circle?: string;
  taxType?: string;
}

export interface PagedReport<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface VatCollectionRow {
  id: number;
  binNo: string;
  businessName: string;
  taxpayerName: string;
  zone: string;
  circle: string;
  period: string;
  grossSales: number;
  outputVat: number;        
  inputVatCredit: number; 
  netVat: number;
  status: string;
  submittedAt: string;
}

export interface IncomeTaxRow {
  id: number;
  tinNumber: string;
  taxpayerName: string;
  taxpayerType: string;
  assessmentYear: string;
  grossIncome: number;
  taxableIncome: number;
  taxPayable: number;
  taxPaid: number;
  taxDue: number;
  status: string;
  filedAt: string;
}

export interface PenaltyReportRow {
  id: number;
  penaltyRefNo: string;
  taxpayerName: string;
  tinNumber: string;
  penaltyType: string;
  severity: string;
  baseAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  status: string;
  issuedAt: string;
  paidAt: string;
}

export interface RefundReportRow {
  id: number;
  refundRefNo: string;
  taxpayerName: string;
  tinNumber: string;
  refundType: string;
  claimedAmount: number;
  approvedAmount: number;
  paidAmount: number; 
  status: string;
  submittedAt: string;
  processedAt: string;      
  riskLevel: string;        
  fiscalYearName: string;
}
