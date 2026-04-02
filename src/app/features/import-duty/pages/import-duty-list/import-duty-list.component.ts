import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImportDuty } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-list',
  templateUrl: './import-duty-list.component.html',
  styleUrls: ['./import-duty-list.component.css']
})
export class ImportDutyListComponent implements OnInit {

  records: ImportDuty[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: ImportDuty[] = [
    { id: 1, dutyRef: 'IMP-2024-00001', tinNumber: 'TIN-1001', taxpayerName: 'Abdul Rahman', businessName: 'Rahman Textile Ltd.', productName: 'Industrial Machinery', hsCode: '8428.90.00', goodsDescription: '2x CNC Textile Machinery', originCountry: 'China', cifValue: 5000000, dutyRate: 5, dutyAmount: 250000, vatOnImport: 787500, totalPayable: 1037500, paidAmount: 1037500, portOfEntry: 'Chittagong Port', billOfLading: 'BL-2024-44821', importDate: '2024-03-15', assessmentDate: '2024-03-18', status: 'Cleared', remarks: '' },
    { id: 2, dutyRef: 'IMP-2024-00002', tinNumber: 'TIN-1003', taxpayerName: 'Dr. Nasrin Islam', businessName: 'Dhaka Pharma Co.', productName: 'Pharmaceutical Drug', hsCode: '3004.90.99', goodsDescription: 'API Raw Materials', originCountry: 'India', cifValue: 2000000, dutyRate: 0, dutyAmount: 0, vatOnImport: 0, totalPayable: 0, paidAmount: 0, portOfEntry: 'Benapole Land Port', billOfLading: 'BL-2024-55932', importDate: '2024-03-20', assessmentDate: '2024-03-22', status: 'Cleared', remarks: 'Zero duty - essential medicine' },
    { id: 3, dutyRef: 'IMP-2024-00003', tinNumber: 'TIN-1004', taxpayerName: 'Faruk Hossain', businessName: 'Chittagong Exports', productName: 'Passenger Car', hsCode: '8703.23.10', goodsDescription: '3x Toyota Corolla 1800cc', originCountry: 'Japan', cifValue: 9000000, dutyRate: 25, dutyAmount: 2250000, vatOnImport: 1706250, totalPayable: 3956250, paidAmount: 0, portOfEntry: 'Chittagong Port', billOfLading: 'BL-2024-66743', importDate: '2024-04-01', assessmentDate: '2024-04-05', status: 'Assessed', remarks: 'Payment pending' },
    { id: 4, dutyRef: 'IMP-2024-00004', tinNumber: 'TIN-1006', taxpayerName: 'Imran Ahmed', businessName: 'BD Tech Solutions', productName: 'Mobile Phone', hsCode: '8517.12.00', goodsDescription: '500x Smartphones', originCountry: 'China', cifValue: 3000000, dutyRate: 25, dutyAmount: 750000, vatOnImport: 562500, totalPayable: 1312500, paidAmount: 1312500, portOfEntry: 'Dhaka Air Freight', billOfLading: 'AWB-2024-77854', importDate: '2024-04-10', assessmentDate: '2024-04-12', status: 'Paid', remarks: '' },
    { id: 5, dutyRef: 'IMP-2024-00005', tinNumber: 'TIN-1002', taxpayerName: 'Karim Uddin', businessName: 'Karim Traders', productName: 'Woven Fabric', hsCode: '5208.11.10', goodsDescription: '10,000m Cotton Fabric', originCountry: 'Bangladesh (Re-import)', cifValue: 800000, dutyRate: 5, dutyAmount: 40000, vatOnImport: 126000, totalPayable: 166000, paidAmount: 0, portOfEntry: 'Dhaka ICD', billOfLading: 'BL-2024-88965', importDate: '2024-04-15', assessmentDate: '', status: 'Pending', remarks: '' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.records = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): ImportDuty[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();
    return this.records.filter(r =>
      r.dutyRef.toLowerCase().includes(term)        ||
      r.taxpayerName.toLowerCase().includes(term)   ||
      r.businessName.toLowerCase().includes(term)   ||
      r.productName.toLowerCase().includes(term)    ||
      r.originCountry.toLowerCase().includes(term)  ||
      r.portOfEntry.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Pending': 'status-pending',
      'Assessed': 'status-review', 'Paid': 'status-paid',
      'Cleared': 'status-active', 'Disputed': 'status-suspended'
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a === 0) return '৳0';
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  delete(id: number): void {
    if (!confirm('Delete this import record?')) return;
    this.records = this.records.filter(r => r.id !== id);
  }

  view(id: number): void { this.router.navigate(['/import-duty/view', id]); }
  edit(id: number): void { this.router.navigate(['/import-duty/edit', id]); }
}