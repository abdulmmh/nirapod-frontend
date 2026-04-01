import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-return-view',
  templateUrl: './income-tax-return-view.component.html',
  styleUrls: ['./income-tax-return-view.component.css']
})
export class IncomeTaxReturnViewComponent implements OnInit {

  itr: IncomeTaxReturn | null = null;
  isLoading = true;

  private fallback: IncomeTaxReturn[] = [
    { id: 1, returnNo: 'ITR-2024-00001', tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim', itrCategory: 'Individual', assessmentYear: '2024-25', incomeYear: '2023-24', returnPeriod: 'Annual', grossIncome: 1200000, exemptIncome: 200000, taxableIncome: 1000000, taxRate: 15, grossTax: 150000, taxRebate: 10000, netTaxPayable: 140000, advanceTaxPaid: 50000, withholdingTax: 30000, taxPaid: 60000, refundable: 0, submissionDate: '2024-11-25', dueDate: '2024-11-30', status: 'Accepted', submittedBy: 'Taxpayer', verifiedBy: 'Tax Officer', remarks: '' },
    { id: 2, returnNo: 'ITR-2024-00002', tinNumber: 'TIN-1002', taxpayerName: 'Rahman Textile Ltd.', itrCategory: 'Company', assessmentYear: '2024-25', incomeYear: '2023-24', returnPeriod: 'Annual', grossIncome: 5000000, exemptIncome: 0, taxableIncome: 5000000, taxRate: 27.5, grossTax: 1375000, taxRebate: 0, netTaxPayable: 1375000, advanceTaxPaid: 800000, withholdingTax: 200000, taxPaid: 375000, refundable: 0, submissionDate: '2024-11-28', dueDate: '2024-11-30', status: 'Accepted', submittedBy: 'Tax Officer', verifiedBy: 'Tax Commissioner', remarks: '' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itr = this.fallback.find(r => r.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Submitted': 'status-pending',
      'Accepted': 'status-active', 'Rejected': 'status-suspended',
      'Overdue': 'status-overdue', 'Under Review': 'status-review',
      'Amended': 'status-amended'
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

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/income-tax-returns/edit', this.itr?.id]); }
  onBack(): void { this.router.navigate(['/income-tax-returns']); }
}