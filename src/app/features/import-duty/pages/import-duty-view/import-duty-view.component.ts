import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportDuty } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-view',
  templateUrl: './import-duty-view.component.html',
  styleUrls: ['./import-duty-view.component.css'],
})
export class ImportDutyViewComponent implements OnInit {
  record: ImportDuty | null = null;
  isLoading = true;

  private fallback: ImportDuty[] = [
    {
      id: 1,
      dutyRef: 'IMP-2024-00001',
      tinNumber: 'TIN-1001',
      taxpayerName: 'Abdul Rahman',
      businessName: 'Rahman Textile Ltd.',
      productName: 'Industrial Machinery',
      hsCode: '8428.90.00',
      goodsDescription: '2x CNC Textile Machinery',
      originCountry: 'China',
      cifValue: 5000000,
      dutyRate: 5,
      dutyAmount: 250000,
      vatOnImport: 787500,
      totalPayable: 1037500,
      paidAmount: 1037500,
      portOfEntry: 'Chittagong Port',
      billOfLading: 'BL-2024-44821',
      importDate: '2024-03-15',
      assessmentDate: '2024-03-18',
      status: 'Cleared',
      remarks: '',
    },
    {
      id: 2,
      dutyRef: 'IMP-2024-00002',
      tinNumber: 'TIN-1003',
      taxpayerName: 'Dr. Nasrin Islam',
      businessName: 'Dhaka Pharma Co.',
      productName: 'Pharmaceutical Drug',
      hsCode: '3004.90.99',
      goodsDescription: 'API Raw Materials',
      originCountry: 'India',
      cifValue: 2000000,
      dutyRate: 0,
      dutyAmount: 0,
      vatOnImport: 0,
      totalPayable: 0,
      paidAmount: 0,
      portOfEntry: 'Benapole Land Port',
      billOfLading: 'BL-2024-55932',
      importDate: '2024-03-20',
      assessmentDate: '2024-03-22',
      status: 'Cleared',
      remarks: 'Zero duty - essential medicine',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.record = this.fallback.find((r) => r.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Pending: 'status-pending',
      Assessed: 'status-review',
      Paid: 'status-paid',
      Cleared: 'status-active',
      Disputed: 'status-suspended',
    };
    return map[s] ?? '';
  }

  fmt(a: number): string {
    if (a === 0) return '৳0';
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString('en-BD')}`;
  }

  onEdit(): void {
    this.router.navigate(['/import-duty/edit', this.record?.id]);
  }
  onBack(): void {
    this.router.navigate(['/import-duty']);
  }
}
