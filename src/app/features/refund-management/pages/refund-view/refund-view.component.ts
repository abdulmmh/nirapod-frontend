import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefundService, RefundDetail } from '../../services/refund.service';

@Component({
  selector: 'app-refund-view',
  templateUrl: './refund-view.component.html',
  styleUrls: ['./refund-view.component.css'],
})
export class RefundViewComponent implements OnInit {
  refund: RefundDetail | null = null;
  loading = true;
  errorMessage = '';
  cancellingId: number | null = null;

  readonly refundTypeLabels: Record<string, string> = {
    INCOME_TAX: 'Income Tax', VAT: 'VAT', AIT: 'AIT',
    DUPLICATE_PAYMENT: 'Duplicate Payment',
    APPEAL_DECISION: 'Appeal Decision', OTHER: 'Other',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private refundService: RefundService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/refunds']); return; }
    this.loadRefund(id);
  }

  loadRefund(id: number): void {
    this.loading = true;
    this.refundService.getById(id).subscribe({
      next: (r) => { this.refund = r; this.loading = false; },
      error: () => { this.errorMessage = 'Could not load refund details.'; this.loading = false; },
    });
  }

  get canEdit():    boolean { return this.refund?.status === 'DRAFT'; }
  get canCancel():  boolean { return ['DRAFT','SUBMITTED'].includes(this.refund?.status ?? ''); }
  get canRespond(): boolean { return this.refund?.status === 'INFO_REQUESTED'; }
  get isPaid():     boolean { return ['PAID','CLOSED'].includes(this.refund?.status ?? ''); }

  edit(): void { this.router.navigate(['/refunds', this.refund!.id, 'edit']); }

  cancel(): void {
    if (!confirm('Are you sure you want to cancel this application?')) return;
    this.refundService.cancel(this.refund!.id).subscribe({
      next: () => this.router.navigate(['/refunds']),
      error: () => alert('Failed to cancel application.'),
    });
  }

  respond(): void { this.router.navigate(['/refunds', this.refund!.id, 'respond']); }
  back(): void { this.router.navigate(['/refunds']); }

  downloadDocument(docId: number): void {
    this.refundService.getDocumentDownloadUrl(this.refund!.id, docId).subscribe({
      next: (res) => window.open(res.url, '_blank'),
      error: () => alert('Could not generate download link.'),
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '—';
    return '৳ ' + amount.toLocaleString('en-BD');
  }
}
