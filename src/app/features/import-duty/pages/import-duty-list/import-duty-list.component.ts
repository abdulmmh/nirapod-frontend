import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { ImportDuty } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-list',
  templateUrl: './import-duty-list.component.html',
  styleUrls: ['./import-duty-list.component.css'],
})
export class ImportDutyListComponent implements OnInit {
  records: ImportDuty[] = [];
  searchTerm = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private fallback: ImportDuty[] = [
    this.record(
      1,
      'IMP-2024-00001',
      'TIN-1001',
      'Abdul Rahman',
      'Rahman Textile Ltd.',
      'Industrial Machinery',
      '8428.90.00',
      '2x CNC Textile Machinery',
      'China',
      5000000,
      5,
      250000,
      0,
      787500,
      250000,
      250000,
      1537500,
      1537500,
      'Chittagong Port',
      'BOE-2024-00001',
      '2024-03-18',
      'BL-2024-44821',
      '2024-03-15',
      '2024-03-18',
      'Cleared',
      '',
    ),
    this.record(
      2,
      'IMP-2024-00002',
      'TIN-1003',
      'Dr. Nasrin Islam',
      'Dhaka Pharma Co.',
      'Pharmaceutical Drug',
      '3004.90.99',
      'API Raw Materials',
      'India',
      2000000,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      'Benapole Land Port',
      'BOE-2024-00002',
      '2024-03-22',
      'BL-2024-55932',
      '2024-03-20',
      '2024-03-22',
      'Cleared',
      'Zero duty - essential medicine',
    ),
    this.record(
      3,
      'IMP-2024-00003',
      'TIN-1004',
      'Faruk Hossain',
      'Chittagong Exports',
      'Passenger Car',
      '8703.23.10',
      '3x Toyota Corolla 1800cc',
      'Japan',
      9000000,
      25,
      2250000,
      0,
      1706250,
      450000,
      450000,
      4856250,
      0,
      'Chittagong Port',
      'BOE-2024-00003',
      '2024-04-05',
      'BL-2024-66743',
      '2024-04-01',
      '2024-04-05',
      'Assessed',
      'Payment pending',
    ),
    this.record(
      4,
      'IMP-2024-00004',
      'TIN-1006',
      'Imran Ahmed',
      'BD Tech Solutions',
      'Mobile Phone',
      '8517.12.00',
      '500x Smartphones',
      'China',
      3000000,
      25,
      750000,
      0,
      562500,
      150000,
      150000,
      1612500,
      1312500,
      'Dhaka Air Freight',
      'BOE-2024-00004',
      '2024-04-12',
      'AWB-2024-77854',
      '2024-04-10',
      '2024-04-12',
      'Paid',
      '',
    ),
    this.record(
      5,
      'IMP-2024-00005',
      'TIN-1002',
      'Karim Uddin',
      'Karim Traders',
      'Woven Fabric',
      '5208.11.10',
      '10,000m Cotton Fabric',
      'Bangladesh (Re-import)',
      800000,
      5,
      40000,
      0,
      126000,
      40000,
      40000,
      246000,
      0,
      'Dhaka ICD',
      'BOE-2024-00005',
      '',
      'BL-2024-88965',
      '2024-04-15',
      '',
      'Pending',
      '',
    ),
  ];

  constructor(private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.records = this.fallback;
      this.isLoading = false;
    }, 400);
  }

  private record(
    id: number,
    dutyRef: string,
    tinNumber: string,
    taxpayerName: string,
    businessName: string,
    productName: string,
    hsCode: string,
    goodsDescription: string,
    originCountry: string,
    cifValue: number,
    cdRate: number,
    customsDuty: number,
    supplementaryDuty: number,
    vat: number,
    advanceIncomeTax: number,
    advanceTax: number,
    totalPayable: number,
    paidAmount: number,
    portOfEntry: string,
    boeNumber: string,
    boeDate: string,
    billOfLading: string,
    importDate: string,
    assessmentDate: string,
    status: ImportDuty['status'],
    remarks: string,
  ): ImportDuty {
    return {
      id,
      dutyRef,
      tinNumber,
      taxpayerName,
      businessName,
      productName,
      hsCode,
      goodsDescription,
      originCountry,
      cifValue,
      cdRate,
      sdRate: 0,
      vatRate: vat > 0 ? 15 : 0,
      aitRate: advanceIncomeTax > 0 ? 5 : 0,
      atRate: advanceTax > 0 ? 5 : 0,
      customsDuty,
      supplementaryDuty,
      vat,
      advanceIncomeTax,
      advanceTax,
      totalPayable,
      paidAmount,
      portOfEntry,
      boeNumber,
      boeDate,
      billOfLading,
      importDate,
      assessmentDate,
      status,
      remarks,
    };
  }

  get filtered(): ImportDuty[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();
    return this.records.filter(
      (r) =>
        r.dutyRef.toLowerCase().includes(term) ||
        r.taxpayerName.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.originCountry.toLowerCase().includes(term) ||
        r.portOfEntry.toLowerCase().includes(term) ||
        r.boeNumber.toLowerCase().includes(term),
    );
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

  formatCurrency(a: number): string {
    if (a === 0) return 'BDT 0';
    if (a >= 100000) return `BDT ${(a / 100000).toFixed(2)}L`;
    return `BDT ${a.toLocaleString('en-BD')}`;
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.records = this.records.filter((r) => r.id !== id);
    this.toast.success('Import duty record deleted successfully.');
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  view(id: number): void {
    this.router.navigate(['/import-duty/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/import-duty/edit', id]);
  }
}
