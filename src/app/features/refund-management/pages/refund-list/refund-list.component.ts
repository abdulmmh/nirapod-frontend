import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RefundSummary, RefundFilterRequest } from 'src/app/models/refund.model';
import {
  RefundService
} from '../../services/refund.service';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css'],
})
export class RefundListComponent implements OnInit {
  refunds: RefundSummary[] = [];
  loading = false;
  errorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  filter: RefundFilterRequest = {
    page: 0,
    size: 10,
    sortBy: 'submittedAt',
    sortDir: 'DESC',
  };
  selectedStatus = '';
  selectedType = '';
  selectedFiscalYear = '';

  // Summary stats (fetched from first load)
  totalClaimed = 0;
  totalApproved = 0;
  totalPaid = 0;
  totalPending = 0;

  readonly statuses = [
    'DRAFT', 'SUBMITTED', 'UNDER_VERIFICATION', 'INFO_REQUESTED',
    'RESPONSE_RECEIVED', 'RECOMMENDED', 'SUPERVISOR_REVIEW',
    'APPROVED', 'REJECTED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING',
    'PAID', 'FAILED', 'CANCELLED', 'CLOSED',
  ];

  readonly refundTypes = [
    { value: 'INCOME_TAX',       label: 'Income Tax' },
    { value: 'VAT',              label: 'VAT' },
    { value: 'AIT',              label: 'AIT' },
    { value: 'DUPLICATE_PAYMENT',label: 'Duplicate Payment' },
    { value: 'APPEAL_DECISION',  label: 'Appeal Decision' },
    { value: 'OTHER',            label: 'Other' },
  ];

  readonly refundTypeLabels: Record<string, string> = {
    INCOME_TAX:        'Income Tax',
    VAT:               'VAT',
    AIT:               'AIT',
    DUPLICATE_PAYMENT: 'Duplicate Payment',
    APPEAL_DECISION:   'Appeal Decision',
    OTHER:             'Other',
  };

  constructor(private refundService: RefundService, private router: Router) {}

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.loading = true;
    this.errorMessage = '';

    const req: RefundFilterRequest = {
      ...this.filter,
      page: this.currentPage,
      size: this.pageSize,
      status: this.selectedStatus || undefined,
      refundType: this.selectedType || undefined,
    };

    this.refundService.getMyRefunds(req).subscribe({
      next: (res) => {
        this.refunds = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load refund applications. Please try again.';
        this.loading = false;
      },
    });
  }

  calculateStats(): void {
    this.totalClaimed  = this.refunds.reduce((s, r) => s + (r.claimedRefundAmount ?? 0), 0);
    this.totalApproved = this.refunds.filter(r => ['APPROVED','PAYMENT_PENDING','PAYMENT_PROCESSING','PAID','CLOSED'].includes(r.status))
                                      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);
    this.totalPaid     = this.refunds.filter(r => r.status === 'PAID' || r.status === 'CLOSED')
                                      .reduce((s, r) => s + (r.approvedRefundAmount ?? 0), 0);
    this.totalPending  = this.refunds.filter(r =>
      ['SUBMITTED','UNDER_VERIFICATION','INFO_REQUESTED','RESPONSE_RECEIVED',
       'RECOMMENDED','SUPERVISOR_REVIEW','PAYMENT_PENDING','PAYMENT_PROCESSING'].includes(r.status)
    ).length;
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadRefunds();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedFiscalYear = '';
    this.currentPage = 0;
    this.loadRefunds();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadRefunds();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  canEdit(r: RefundSummary): boolean   { return r.status === 'DRAFT'; }
  canCancel(r: RefundSummary): boolean { return ['DRAFT','SUBMITTED'].includes(r.status); }
  canRespond(r: RefundSummary): boolean{ return r.status === 'INFO_REQUESTED'; }

  navigateToCreate(): void { this.router.navigate(['/refunds/create']); }
  navigateToView(id: number): void { this.router.navigate(['/refunds', id, 'view']); }
  navigateToEdit(id: number): void { this.router.navigate(['/refunds', id, 'edit']); }
  navigateToRespond(id: number): void { this.router.navigate(['/refunds', id, 'respond']); }

  cancelRefund(id: number): void {
    if (!confirm('Are you sure you want to cancel this refund application?')) return;
    this.refundService.cancel(id).subscribe({
      next: () => this.loadRefunds(),
      error: () => alert('Failed to cancel the application.'),
    });
  }

  formatCurrency(amount: number | null): string {
    if (amount == null) return '—';
    return '৳ ' + amount.toLocaleString('en-BD');
  }
}
