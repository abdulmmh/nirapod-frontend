import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  DashboardStats, RecentTaxpayer, RecentPayment,
  RecentAudit, RecentEntry, MyNotice, MyReturn,
  DashboardChartData
} from '../../../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {

  constructor(http: HttpClient) { super(http); }

  getStats():            Observable<DashboardStats>    { return this.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS); }
  getRecentTaxpayers():  Observable<RecentTaxpayer[]>  { return this.get<RecentTaxpayer[]>(API_ENDPOINTS.DASHBOARD.RECENT_TAXPAYERS); }
  getRecentPayments():   Observable<RecentPayment[]>   { return this.get<RecentPayment[]>(API_ENDPOINTS.DASHBOARD.RECENT_PAYMENTS); }
  getChartData():        Observable<DashboardChartData>{ return this.get<DashboardChartData>(API_ENDPOINTS.DASHBOARD.VAT_CHART); }

  loadAll(): Observable<any[]> {
    return forkJoin([
      this.getStats().pipe(catchError(()           => of(this.mockStats()))),
      this.getRecentTaxpayers().pipe(catchError(()  => of(this.mockTaxpayers()))),
      this.getRecentPayments().pipe(catchError(()   => of(this.mockPayments()))),
      this.getChartData().pipe(catchError(()        => of(this.mockChartData()))),
      of(this.mockAudits()),
      of(this.mockEntries()),
      of(this.mockNotices()),
      of(this.mockMyReturns()),
    ]);
  }

  // ── Mock Data ──────────────────────────────────────

  mockStats(): DashboardStats {
    return {
      totalTaxpayers: 24850, totalBusinesses: 8320,
      totalVatReturns: 15640, totalPayments: 32100,
      totalRevenue: 458920000, pendingAudits: 142,
      pendingRefunds: 89, issuedPenalties: 315,
      taxpayerGrowth: 12.5, revenueGrowth: 8.3,
      vatReturnGrowth: 15.2, paymentGrowth: 9.7,
      totalAudits: 890, completedAudits: 748,
      flaggedCases: 34, auditGrowth: 6.4,
      todayEntries: 47, pendingTasks: 12,
      taxpayersAddedThisMonth: 183,
      myVatReturns: 6, myPayments: 8,
      myPendingNotices: 2, myRefundStatus: 1,
      myTotalPaid: 245000
    };
  }

  mockTaxpayers(): RecentTaxpayer[] {
    return [
      { id: 1, tin: 'TIN-2024-00891', fullName: 'Rahman Textile Ltd.',  email: 'rahman@textile.com',  phone: '01711-234567', status: 'Active',   registrationDate: '2024-03-10' },
      { id: 2, tin: 'TIN-2024-00892', fullName: 'Karim Traders',        email: 'karim@traders.com',   phone: '01811-345678', status: 'Active',   registrationDate: '2024-03-11' },
      { id: 3, tin: 'TIN-2024-00893', fullName: 'Dhaka Pharma Co.',     email: 'info@dhakpharma.com', phone: '01911-456789', status: 'Inactive', registrationDate: '2024-03-12' },
      { id: 4, tin: 'TIN-2024-00894', fullName: 'Chittagong Exports',   email: 'ctg@exports.com',     phone: '01611-567890', status: 'Active',   registrationDate: '2024-03-13' },
      { id: 5, tin: 'TIN-2024-00895', fullName: 'Sylhet Tea House',     email: 'tea@sylhet.com',      phone: '01511-678901', status: 'Suspended',registrationDate: '2024-03-14' },
    ];
  }

  mockPayments(): RecentPayment[] {
    return [
      { id: 1, transactionId: 'TXN-2024-44821', taxpayerName: 'Rahman Textile Ltd.', amount: 125000, paymentType: 'VAT',         paymentDate: '2024-03-15', status: 'Completed' },
      { id: 2, transactionId: 'TXN-2024-44822', taxpayerName: 'Karim Traders',       amount: 87500,  paymentType: 'Income Tax',  paymentDate: '2024-03-15', status: 'Completed' },
      { id: 3, transactionId: 'TXN-2024-44823', taxpayerName: 'Dhaka Pharma Co.',    amount: 210000, paymentType: 'VAT',         paymentDate: '2024-03-14', status: 'Pending'   },
      { id: 4, transactionId: 'TXN-2024-44824', taxpayerName: 'Chittagong Exports',  amount: 55000,  paymentType: 'Penalty',     paymentDate: '2024-03-14', status: 'Completed' },
      { id: 5, transactionId: 'TXN-2024-44825', taxpayerName: 'Sylhet Tea House',    amount: 33000,  paymentType: 'VAT',         paymentDate: '2024-03-13', status: 'Failed'    },
    ];
  }

  mockAudits(): RecentAudit[] {
    return [
      { id: 1, auditNo: 'AUD-2024-001', taxpayerName: 'Rahman Textile Ltd.',  auditType: 'VAT Audit',    assignedDate: '2024-03-01', status: 'In Progress' },
      { id: 2, auditNo: 'AUD-2024-002', taxpayerName: 'Karim Traders',        auditType: 'Income Tax',   assignedDate: '2024-03-05', status: 'Pending'     },
      { id: 3, auditNo: 'AUD-2024-003', taxpayerName: 'Dhaka Pharma Co.',     auditType: 'Full Audit',   assignedDate: '2024-03-08', status: 'Flagged'     },
      { id: 4, auditNo: 'AUD-2024-004', taxpayerName: 'Chittagong Exports',   auditType: 'VAT Audit',    assignedDate: '2024-03-10', status: 'Completed'   },
      { id: 5, auditNo: 'AUD-2024-005', taxpayerName: 'BD Tech Solutions',    auditType: 'IT Audit',     assignedDate: '2024-03-12', status: 'Pending'     },
    ];
  }

  mockEntries(): RecentEntry[] {
    return [
      { id: 1, entryType: 'Taxpayer',    description: 'Added Abdul Karim (TIN-1001)',       enteredAt: '2024-03-15 09:30', status: 'Approved' },
      { id: 2, entryType: 'Business',    description: 'Registered Rahman Textile Ltd.',     enteredAt: '2024-03-15 10:15', status: 'Approved' },
      { id: 3, entryType: 'VAT Return',  description: 'Filed return for Karim Traders',     enteredAt: '2024-03-15 11:00', status: 'Pending'  },
      { id: 4, entryType: 'TIN',         description: 'Issued TIN-2024-00895',              enteredAt: '2024-03-15 13:45', status: 'Saved'    },
      { id: 5, entryType: 'Payment',     description: 'Recorded TXN-2024-44825',            enteredAt: '2024-03-15 14:30', status: 'Approved' },
    ];
  }

  mockNotices(): MyNotice[] {
    return [
      { id: 1, noticeNo: 'NOT-2024-001', subject: 'VAT Return Due Reminder',     issuedDate: '2024-03-01', dueDate: '2024-03-31', status: 'Unread'    },
      { id: 2, noticeNo: 'NOT-2024-002', subject: 'Income Tax Filing Reminder',  issuedDate: '2024-03-05', dueDate: '2024-04-15', status: 'Read'      },
      { id: 3, noticeNo: 'NOT-2024-003', subject: 'Penalty Notice',              issuedDate: '2024-03-10', dueDate: '2024-03-20', status: 'Responded' },
    ];
  }

  mockMyReturns(): MyReturn[] {
    return [
      { id: 1, returnNo: 'VAT-2024-001', period: 'Jan 2024', submittedDate: '2024-02-15', amount: 45000,  status: 'Approved'  },
      { id: 2, returnNo: 'VAT-2024-002', period: 'Feb 2024', submittedDate: '2024-03-15', amount: 52000,  status: 'Submitted' },
      { id: 3, returnNo: 'IT-2024-001',  period: 'FY 2023',  submittedDate: '2024-01-30', amount: 125000, status: 'Approved'  },
    ];
  }

  mockChartData(): DashboardChartData {
    return {
      vatChart:     [
        { label: 'Oct', value: 3200000 }, { label: 'Nov', value: 4100000 },
        { label: 'Dec', value: 3800000 }, { label: 'Jan', value: 5200000 },
        { label: 'Feb', value: 4700000 }, { label: 'Mar', value: 6100000 }
      ],
      paymentChart: [
        { label: 'Oct', value: 2800000 }, { label: 'Nov', value: 3500000 },
        { label: 'Dec', value: 3100000 }, { label: 'Jan', value: 4400000 },
        { label: 'Feb', value: 3900000 }, { label: 'Mar', value: 5300000 }
      ],
      auditChart: [
        { label: 'Oct', value: 28 }, { label: 'Nov', value: 35 },
        { label: 'Dec', value: 42 }, { label: 'Jan', value: 38 },
        { label: 'Feb', value: 51 }, { label: 'Mar', value: 44 }
      ],
      myPaymentChart: [
        { label: 'Oct', value: 35000 }, { label: 'Nov', value: 42000 },
        { label: 'Dec', value: 38000 }, { label: 'Jan', value: 45000 },
        { label: 'Feb', value: 52000 }, { label: 'Mar', value: 48000 }
      ]
    };
  }
}