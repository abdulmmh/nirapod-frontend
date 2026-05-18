import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefundService, RefundDetail } from '../../services/refund.service';

@Component({
  selector: 'app-refund-success',
  templateUrl: './refund-success.component.html',
  styleUrls: ['./refund-success.component.css'],
})
export class RefundSuccessComponent implements OnInit {
  refund: RefundDetail | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private refundService: RefundService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.refundService.getById(id).subscribe({
      next: (r) => { this.refund = r; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  goToList():   void { this.router.navigate(['/refunds']); }
  goToView():   void { this.router.navigate(['/refunds', this.refund?.id, 'view']); }
  goToCreate(): void { this.router.navigate(['/refunds/create']); }

  formatCurrency(v: number | null): string {
    if (v == null) return '—';
    return '৳ ' + v.toLocaleString('en-BD');
  }
}
