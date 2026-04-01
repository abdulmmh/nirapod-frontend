import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatReturn } from '../../../../models/vat-return.model';

@Component({
  selector: 'app-vat-return-view',
  templateUrl: './vat-return-view.component.html',
  styleUrls: ['./vat-return-view.component.css']
})
export class VatReturnViewComponent implements OnInit {

  vr: VatReturn | null = null;
  isLoading = true;

  private fallback: VatReturn[] = [
    { id: 1, returnNo: 'VRT-2024-00001', binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001', businessName: 'Rahman Textile Ltd.', returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024', taxableSupplies: 500000, exemptSupplies: 0, zeroRatedSupplies: 0, totalSupplies: 500000, outputTax: 75000, inputTax: 30000, netTaxPayable: 45000, taxPaid: 45000, submissionDate: '2024-02-12', dueDate: '2024-02-15', assessmentYear: '2024-25', status: 'Accepted', submittedBy: 'Taxpayer', remarks: '' },
    { id: 2, returnNo: 'VRT-2024-00002', binNo: 'BIN-2024-001002', tinNumber: 'TIN-1002', businessName: 'Karim Traders', returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024', taxableSupplies: 120000, exemptSupplies: 0, zeroRatedSupplies: 0, totalSupplies: 120000, outputTax: 18000, inputTax: 8000, netTaxPayable: 10000, taxPaid: 0, submissionDate: '2024-02-18', dueDate: '2024-02-15', assessmentYear: '2024-25', status: 'Overdue', submittedBy: 'Taxpayer', remarks: 'Late submission' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vr = this.fallback.find(r => r.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Submitted': 'status-pending',
      'Accepted': 'status-active', 'Rejected': 'status-suspended',
      'Overdue': 'status-overdue', 'Amended': 'status-amended'
    };
    return map[s] ?? '';
  }

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/vat-returns/edit', this.vr?.id]); }
  onBack(): void { this.router.navigate(['/vat-returns']); }
}