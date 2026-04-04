import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatReturn, VatReturnAction } from '../../../../models/vat-return.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-vat-return-view',
  templateUrl: './vat-return-view.component.html',
  styleUrls: ['./vat-return-view.component.css']
})
export class VatReturnViewComponent implements OnInit {

  vr: VatReturn | null = null;
  isLoading   = true;
  isActing    = false;
  actionMsg   = '';
  actionError = '';

  // Workflow modal
  showActionModal = false;
  currentAction   = '';
  actionRemarks   = '';

  Role = Role;

  private fallbackData: VatReturn[] = [
    {
      id: 1, returnNo: 'VRT-2024-00001',
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.',
      returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024',
      taxableSupplies: 500000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 500000, outputTax: 75000, inputTax: 30000,
      netTaxPayable: 45000, taxPaid: 45000,
      submissionDate: '2024-02-12', dueDate: '2024-02-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-02-12 10:30', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-02-13 09:00', remarks: 'All documents verified', fromStatus: 'Submitted', toStatus: 'Under Review' },
        { action: 'Return Accepted', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-02-14 14:00', remarks: 'Return is accurate and complete', fromStatus: 'Under Review', toStatus: 'Accepted' }
      ]
    },
    {
      id: 3, returnNo: 'VRT-2024-00003',
      binNo: 'BIN-2024-001004', tinNumber: 'TIN-1004',
      businessName: 'Chittagong Exports',
      returnPeriod: 'Monthly', periodMonth: 'February', periodYear: '2024',
      taxableSupplies: 800000, exemptSupplies: 0, zeroRatedSupplies: 200000,
      totalSupplies: 1000000, outputTax: 120000, inputTax: 55000,
      netTaxPayable: 65000, taxPaid: 65000,
      submissionDate: '2024-03-14', dueDate: '2024-03-15',
      assessmentYear: '2024-25', status: 'Under Review',
      submittedBy: 'Tax Officer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-03-14 11:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-03-15 09:30', remarks: 'Large export claim', fromStatus: 'Submitted', toStatus: 'Under Review' }
      ]
    },
    {
      id: 4, returnNo: 'VRT-2024-00004',
      binNo: 'BIN-2024-001006', tinNumber: 'TIN-1006',
      businessName: 'BD Tech Solutions',
      returnPeriod: 'Quarterly', periodMonth: 'Q1', periodYear: '2024',
      taxableSupplies: 650000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 650000, outputTax: 97500, inputTax: 40000,
      netTaxPayable: 57500, taxPaid: 0,
      submissionDate: '2024-04-10', dueDate: '2024-04-15',
      assessmentYear: '2024-25', status: 'Submitted',
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-04-10 15:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' }
      ]
    },
    {
      id: 6, returnNo: 'VRT-2024-00006',
      binNo: 'BIN-2024-001002', tinNumber: 'TIN-1002',
      businessName: 'Karim Traders',
      returnPeriod: 'Monthly', periodMonth: 'March', periodYear: '2024',
      taxableSupplies: 130000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 130000, outputTax: 19500, inputTax: 9000,
      netTaxPayable: 10500, taxPaid: 0,
      submissionDate: '2024-04-05', dueDate: '2024-04-15',
      assessmentYear: '2024-25', status: 'Rejected',
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-04-05 10:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-04-06 09:00', remarks: '', fromStatus: 'Submitted', toStatus: 'Under Review' },
        { action: 'Return Rejected', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-04-07 11:00', remarks: 'Input tax claim mismatch — supporting docs required', fromStatus: 'Under Review', toStatus: 'Rejected' }
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
    this.vr = this.fallbackData.find(r => r.id === id) || this.fallbackData[0];
    this.isLoading = false;
  }

  // ── Workflow Permission Checks ──

  canSubmit(): boolean {
    return this.vr?.status === 'Draft' || this.vr?.status === 'Send Back';
  }

  canStartReview(): boolean {
    return this.vr?.status === 'Submitted' &&
           this.authService.hasRole(Role.TAX_OFFICER);
  }

  canAccept(): boolean {
    return this.vr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
            this.authService.hasRole(Role.SUPER_ADMIN));
  }

  canReject(): boolean {
    return this.vr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
            this.authService.hasRole(Role.SUPER_ADMIN));
  }

  canSendBack(): boolean {
    return this.vr?.status === 'Under Review' &&
           (this.authService.hasRole(Role.TAX_OFFICER) ||
            this.authService.hasRole(Role.TAX_COMMISSIONER));
  }

  // ── Open Action Modal ──
  openAction(action: string): void {
    this.currentAction  = action;
    this.actionRemarks  = '';
    this.actionError    = '';
    this.showActionModal = true;
  }

  closeModal(): void {
    this.showActionModal = false;
    this.currentAction   = '';
    this.actionRemarks   = '';
  }

  // ── Execute Action ──
  confirmAction(): void {
    if (!this.vr) return;

    if ((this.currentAction === 'Reject' || this.currentAction === 'Send Back') &&
        !this.actionRemarks.trim()) {
      this.actionError = 'Remarks are required for this action.';
      return;
    }

    this.isActing = true;
    this.actionError = '';

    const statusMap: Record<string, string> = {
      'Submit':       'Submitted',
      'Start Review': 'Under Review',
      'Accept':       'Accepted',
      'Reject':       'Rejected',
      'Send Back':    'Send Back'
    };

    const actionLabelMap: Record<string, string> = {
      'Submit':       'Return Submitted',
      'Start Review': 'Review Started',
      'Accept':       'Return Accepted',
      'Reject':       'Return Rejected',
      'Send Back':    'Sent Back for Correction'
    };

    setTimeout(() => {
      const newStatus = statusMap[this.currentAction] as any;
      const newAction: VatReturnAction = {
        action:      actionLabelMap[this.currentAction],
        performedBy: 'current_user',
        role:        'TAX_OFFICER',
        timestamp:   new Date().toLocaleString('en-BD'),
        remarks:     this.actionRemarks,
        fromStatus:  this.vr!.status,
        toStatus:    newStatus
      };

      this.vr!.status = newStatus;
      if (!this.vr!.actionHistory) this.vr!.actionHistory = [];
      this.vr!.actionHistory.push(newAction);

      this.isActing        = false;
      this.showActionModal = false;
      this.actionMsg       = `Return ${this.currentAction}ed successfully!`;

      setTimeout(() => this.actionMsg = '', 4000);
    }, 800);
  }

  // ── Helpers ──
  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Submitted': 'status-pending',
      'Under Review': 'status-review', 'Accepted': 'status-active',
      'Rejected': 'status-suspended', 'Overdue': 'status-overdue',
      'Amended': 'status-amended', 'Send Back': 'status-sendback'
    };
    return map[s] ?? '';
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'Return Filed':           'bi bi-send-fill',
      'Review Started':         'bi bi-search',
      'Return Accepted':        'bi bi-check-circle-fill',
      'Return Rejected':        'bi bi-x-circle-fill',
      'Sent Back for Correction': 'bi bi-arrow-return-left'
    };
    return map[action] ?? 'bi bi-circle-fill';
  }

  getActionColor(toStatus: string): string {
    const map: Record<string, string> = {
      'Submitted':    'tl-blue',
      'Under Review': 'tl-purple',
      'Accepted':     'tl-green',
      'Rejected':     'tl-red',
      'Send Back':    'tl-orange'
    };
    return map[toStatus] ?? 'tl-gray';
  }

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/vat-returns/edit', this.vr?.id]); }
  onBack(): void { this.router.navigate(['/vat-returns']); }
}