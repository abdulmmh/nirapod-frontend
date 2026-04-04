import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeTaxReturn, ITRAction } from '../../../../models/income-tax-return.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-income-tax-return-view',
  templateUrl: './income-tax-return-view.component.html',
  styleUrls: ['./income-tax-return-view.component.css']
})
export class IncomeTaxReturnViewComponent implements OnInit {

  itr: IncomeTaxReturn | null = null;
  isLoading   = true;
  isActing    = false;
  actionMsg   = '';
  actionError = '';
  showActionModal = false;
  currentAction   = '';
  actionRemarks   = '';

  Role = Role;

  private fallbackData: IncomeTaxReturn[] = [
    {
      id: 1, returnNo: 'ITR-2024-00001', tinNumber: 'TIN-1001',
      taxpayerName: 'Abdul Karim', itrCategory: 'Individual',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      returnPeriod: 'Annual', grossIncome: 1200000, exemptIncome: 200000,
      taxableIncome: 1000000, taxRate: 15, grossTax: 150000,
      taxRebate: 10000, netTaxPayable: 140000, advanceTaxPaid: 50000,
      withholdingTax: 30000, taxPaid: 60000, refundable: 0,
      submissionDate: '2024-11-25', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Taxpayer',
      verifiedBy: 'Tax Officer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-11-25 10:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-11-26 09:00', remarks: 'All income sources verified', fromStatus: 'Submitted', toStatus: 'Under Review' },
        { action: 'Return Accepted', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-11-28 14:00', remarks: 'Return verified and accepted', fromStatus: 'Under Review', toStatus: 'Accepted' }
      ]
    },
    {
      id: 4, returnNo: 'ITR-2024-00004', tinNumber: 'TIN-1004',
      taxpayerName: 'Karim Traders', itrCategory: 'Partnership',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      returnPeriod: 'Annual', grossIncome: 2500000, exemptIncome: 0,
      taxableIncome: 2500000, taxRate: 25, grossTax: 625000,
      taxRebate: 0, netTaxPayable: 625000, advanceTaxPaid: 300000,
      withholdingTax: 100000, taxPaid: 400000, refundable: 0,
      submissionDate: '', dueDate: '2024-11-30',
      status: 'Overdue', submittedBy: '',
      verifiedBy: '', remarks: 'Not yet filed',
      actionHistory: []
    },
    {
      id: 5, returnNo: 'ITR-2024-00005', tinNumber: 'TIN-1005',
      taxpayerName: 'BD Tech Solutions', itrCategory: 'Company',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      returnPeriod: 'Annual', grossIncome: 6500000, exemptIncome: 0,
      taxableIncome: 6500000, taxRate: 27.5, grossTax: 1787500,
      taxRebate: 0, netTaxPayable: 1787500, advanceTaxPaid: 1200000,
      withholdingTax: 300000, taxPaid: 1500000, refundable: 0,
      submissionDate: '2024-11-20', dueDate: '2024-11-30',
      status: 'Under Review', submittedBy: 'Tax Officer',
      verifiedBy: '', remarks: 'Large company — needs detailed review',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-11-20 11:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-11-21 09:00', remarks: 'Large company — needs detailed review', fromStatus: 'Submitted', toStatus: 'Under Review' }
      ]
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itr = this.fallbackData.find(r => r.id === id) || this.fallbackData[0];
    this.isLoading = false;
  }

  // ── Workflow Checks ──
  canSubmit(): boolean {
    return this.itr?.status === 'Draft' || this.itr?.status === 'Send Back';
  }

  canStartReview(): boolean {
    return this.itr?.status === 'Submitted' &&
           this.authService.hasRole(Role.TAX_OFFICER);
  }

  canAccept(): boolean {
    return this.itr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
            this.authService.hasRole(Role.SUPER_ADMIN));
  }

  canReject(): boolean {
    return this.itr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
            this.authService.hasRole(Role.SUPER_ADMIN));
  }

  canSendBack(): boolean {
    return this.itr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_OFFICER) ||
            this.authService.hasRole(Role.TAX_COMMISSIONER));
  }

  openAction(action: string): void {
    this.currentAction   = action;
    this.actionRemarks   = '';
    this.actionError     = '';
    this.showActionModal = true;
  }

  closeModal(): void {
    this.showActionModal = false;
    this.currentAction   = '';
    this.actionRemarks   = '';
  }

  confirmAction(): void {
    if (!this.itr) return;
    if ((this.currentAction === 'Reject' || this.currentAction === 'Send Back') &&
        !this.actionRemarks.trim()) {
      this.actionError = 'Remarks are required for this action.';
      return;
    }

    this.isActing = true; this.actionError = '';

    const statusMap: Record<string, string> = {
      'Submit': 'Submitted', 'Start Review': 'Under Review',
      'Accept': 'Accepted',  'Reject': 'Rejected', 'Send Back': 'Send Back'
    };

    const actionLabelMap: Record<string, string> = {
      'Submit': 'Return Submitted', 'Start Review': 'Review Started',
      'Accept': 'Return Accepted',  'Reject': 'Return Rejected',
      'Send Back': 'Sent Back for Correction'
    };

    setTimeout(() => {
      const newStatus = statusMap[this.currentAction] as any;
      const newAction: ITRAction = {
        action:      actionLabelMap[this.currentAction],
        performedBy: 'current_user',
        role:        'TAX_OFFICER',
        timestamp:   new Date().toLocaleString('en-BD'),
        remarks:     this.actionRemarks,
        fromStatus:  this.itr!.status,
        toStatus:    newStatus
      };

      this.itr!.status = newStatus;
      if (!this.itr!.actionHistory) this.itr!.actionHistory = [];
      this.itr!.actionHistory.push(newAction);

      this.isActing        = false;
      this.showActionModal = false;
      this.actionMsg       = `Return ${this.currentAction}ed successfully!`;
      setTimeout(() => this.actionMsg = '', 4000);
    }, 800);
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Submitted': 'status-pending',
      'Under Review': 'status-review', 'Accepted': 'status-active',
      'Rejected': 'status-suspended', 'Overdue': 'status-overdue',
      'Amended': 'status-amended', 'Send Back': 'status-sendback'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Individual': 'cat-individual', 'Company': 'cat-company',
      'Partnership': 'cat-partner', 'NGO': 'cat-ngo'
    };
    return map[c] ?? '';
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'Return Filed': 'bi bi-send-fill',
      'Review Started': 'bi bi-search',
      'Return Accepted': 'bi bi-check-circle-fill',
      'Return Rejected': 'bi bi-x-circle-fill',
      'Sent Back for Correction': 'bi bi-arrow-return-left'
    };
    return map[action] ?? 'bi bi-circle-fill';
  }

  getActionColor(toStatus: string): string {
    const map: Record<string, string> = {
      'Submitted': 'tl-blue', 'Under Review': 'tl-purple',
      'Accepted': 'tl-green', 'Rejected': 'tl-red', 'Send Back': 'tl-orange'
    };
    return map[toStatus] ?? 'tl-gray';
  }

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/income-tax-returns/edit', this.itr?.id]); }
  onBack(): void { this.router.navigate(['/income-tax-returns']); }
}