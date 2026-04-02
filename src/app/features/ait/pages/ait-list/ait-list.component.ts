import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';

@Component({
  selector: 'app-ait-list',
  templateUrl: './ait-list.component.html',
  styleUrls: ['./ait-list.component.css']
})
export class AitListComponent implements OnInit {

  records: Ait[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Ait[] = [
    { id: 1, aitRef: 'AIT-2024-00001', tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim', sourceType: 'Salary', taxStructureId: 3, grossAmount: 500000, aitRate: 10, aitAmount: 50000, deductionDate: '2024-01-31', depositDate: '2024-02-07', deductedBy: 'ABC Company Ltd.', fiscalYear: '2024-25', status: 'Deposited', remarks: '' },
    { id: 2, aitRef: 'AIT-2024-00002', tinNumber: 'TIN-1004', taxpayerName: 'Faruk Hossain', sourceType: 'Import', taxStructureId: 4, grossAmount: 5000000, aitRate: 5, aitAmount: 250000, deductionDate: '2024-03-15', depositDate: '2024-03-22', deductedBy: 'Customs Authority', fiscalYear: '2024-25', status: 'Deposited', remarks: '' },
    { id: 3, aitRef: 'AIT-2024-00003', tinNumber: 'TIN-1002', taxpayerName: 'Karim Uddin', sourceType: 'Contract', taxStructureId: 5, grossAmount: 800000, aitRate: 7, aitAmount: 56000, deductionDate: '2024-02-15', depositDate: '', deductedBy: 'XYZ Corporation', fiscalYear: '2024-25', status: 'Deducted', remarks: 'Deposit pending' },
    { id: 4, aitRef: 'AIT-2024-00004', tinNumber: 'TIN-1006', taxpayerName: 'Imran Ahmed', sourceType: 'Interest', taxStructureId: 3, grossAmount: 150000, aitRate: 10, aitAmount: 15000, deductionDate: '2024-03-31', depositDate: '2024-04-07', deductedBy: 'BRAC Bank Ltd.', fiscalYear: '2024-25', status: 'Credited', remarks: 'Bank interest AIT' },
    { id: 5, aitRef: 'AIT-2024-00005', tinNumber: 'TIN-1003', taxpayerName: 'Dr. Nasrin Islam', sourceType: 'Dividend', taxStructureId: 3, grossAmount: 200000, aitRate: 10, aitAmount: 20000, deductionDate: '2024-04-15', depositDate: '', deductedBy: 'Dhaka Pharma Co.', fiscalYear: '2024-25', status: 'Draft', remarks: '' },
    { id: 6, aitRef: 'AIT-2024-00006', tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim', sourceType: 'Commission', taxStructureId: 3, grossAmount: 300000, aitRate: 10, aitAmount: 30000, deductionDate: '2024-02-28', depositDate: '2024-03-07', deductedBy: 'DEF Agency', fiscalYear: '2024-25', status: 'Deposited', remarks: '' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.records = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): Ait[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();
    return this.records.filter(r =>
      r.aitRef.toLowerCase().includes(term)          ||
      r.taxpayerName.toLowerCase().includes(term)    ||
      r.tinNumber.toLowerCase().includes(term)       ||
      r.sourceType.toLowerCase().includes(term)      ||
      r.deductedBy.toLowerCase().includes(term)
    );
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
      'Dividend': 'src-dividend', 'Commission': 'src-commission',
      'Export': 'src-export'
    };
    return map[s] ?? '';
  }

  countByStatus(status: string): number {
    return this.records.filter(r => r.status === status).length;
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  get totalAIT(): number { return this.records.reduce((s, r) => s + r.aitAmount, 0); }

  delete(id: number): void {
    if (!confirm('Delete this AIT record?')) return;
    this.records = this.records.filter(r => r.id !== id);
  }

  view(id: number): void { this.router.navigate(['/ait/view', id]); }
  edit(id: number): void { this.router.navigate(['/ait/edit', id]); }
}