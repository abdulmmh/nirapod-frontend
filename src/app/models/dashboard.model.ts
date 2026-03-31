export interface DashboardStats {
  // Common
  totalTaxpayers: number;
  totalBusinesses: number;
  totalVatReturns: number;
  totalPayments: number;
  totalRevenue: number;
  pendingAudits: number;
  pendingRefunds: number;
  issuedPenalties: number;
  taxpayerGrowth: number;
  revenueGrowth: number;
  vatReturnGrowth: number;
  paymentGrowth: number;

  // Auditor specific
  totalAudits: number;
  completedAudits: number;
  flaggedCases: number;
  auditGrowth: number;

  // Data Entry Operator specific
  todayEntries: number;
  pendingTasks: number;
  taxpayersAddedThisMonth: number;

  // Taxpayer specific
  myVatReturns: number;
  myPayments: number;
  myPendingNotices: number;
  myRefundStatus: number;
  myTotalPaid: number;
}

export interface RecentTaxpayer {
  id: number;
  tin: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  registrationDate: string;
}

export interface RecentPayment {
  id: number;
  transactionId: string;
  taxpayerName: string;
  amount: number;
  paymentType: string;
  paymentDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface RecentAudit {
  id: number;
  auditNo: string;
  taxpayerName: string;
  auditType: string;
  assignedDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Flagged';
}

export interface RecentEntry {
  id: number;
  entryType: string;
  description: string;
  enteredAt: string;
  status: 'Saved' | 'Pending' | 'Approved';
}

export interface MyNotice {
  id: number;
  noticeNo: string;
  subject: string;
  issuedDate: string;
  dueDate: string;
  status: 'Unread' | 'Read' | 'Responded';
}

export interface MyReturn {
  id: number;
  returnNo: string;
  period: string;
  submittedDate: string;
  amount: number;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Pending';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardChartData {
  vatChart:     ChartDataPoint[];
  paymentChart: ChartDataPoint[];
  auditChart:   ChartDataPoint[];
  myPaymentChart: ChartDataPoint[];
}