import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';

@Component({
  selector: 'app-ait-view',
  templateUrl: './ait-view.component.html',
  styleUrls: ['./ait-view.component.css']
})
export class AitViewComponent implements OnInit {

  record: Ait | null = null;
  isLoading = true;

  private fallback: Ait[] = [
    { id: 1, aitRef: 'AIT-2024-00001', tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim', sourceType: 'Salary', taxStructureId: 3, grossAmount: 500000, aitRate: 10, aitAmount: 50000, deductionDate: '2024-01-31', depositDate: '2024-02-07', deductedBy: 'ABC Company Ltd.', fiscalYear: '2024-25', status: 'Deposited', remarks: '' },
    { id: 2, aitRef: 'AIT-2024-00002', tinNumber: 'TIN-1004', taxpayerName: 'Faruk Hossain', sourceType: 'Import', taxStructureId: 4, grossAmount: 5000000, aitRate: 5, aitAmount: 250000, deductionDate: '2024-03-15', depositDate: '2024-03-22', deductedBy: 'Customs Authority', fiscalYear: '2024-25', status: 'Deposited', remarks: '' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.record = this.fallback.find(r => r.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Deducted': 'status-pending',
      'Deposited': 'status-active', 'Credited': 'status-credited',
      'Disputed': 'status-suspended'
    };
    return map[s] ?? '';
  }

  getSourceClass(s: string): string {
    const map: Record<string, string> = {
      'Salary': 'src-salary', 'Import': 'src-import',
      'Contract': 'src-contract', 'Interest': 'src-interest',
      'Dividend': 'src-dividend', 'Commission': 'src-commission'
    };
    return map[s] ?? '';
  }

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/ait/edit', this.record?.id]); }
  onBack(): void { this.router.navigate(['/ait']); }
}