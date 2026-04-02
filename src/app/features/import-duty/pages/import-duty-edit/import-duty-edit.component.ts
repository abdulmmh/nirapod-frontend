import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-import-duty-edit',
  templateUrl: './import-duty-edit.component.html',
  styleUrls: ['./import-duty-edit.component.css']
})
export class ImportDutyEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  recordId   = 0;

  statuses  = ['Draft', 'Pending', 'Assessed', 'Paid', 'Cleared', 'Disputed'];
  ports     = ['Chittagong Port', 'Dhaka Air Freight', 'Benapole Land Port', 'Dhaka ICD', 'Mongla Port', 'Sonamsjid Land Port', 'Hili Land Port'];
  countries = ['China', 'India', 'Japan', 'USA', 'Germany', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Other'];

  form: any = {};

  get dutyAmount(): number { return Math.round((this.form.cifValue || 0) * (this.form.dutyRate || 0) / 100); }
  get vatOnImport(): number { return Math.round(((this.form.cifValue || 0) + this.dutyAmount) * 0.15); }
  get totalPayable(): number { return this.dutyAmount + this.vatOnImport; }

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.recordId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.recordId, dutyRef: 'IMP-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Abdul Rahman',
      businessName: 'Rahman Textile Ltd.', productName: 'Industrial Machinery',
      hsCode: '8428.90.00', goodsDescription: '2x CNC Textile Machinery',
      originCountry: 'China', cifValue: 5000000, dutyRate: 5,
      portOfEntry: 'Chittagong Port', billOfLading: 'BL-2024-44821',
      importDate: '2024-03-15', paidAmount: 1037500,
      status: 'Cleared', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.cifValue > 0 && this.form.portOfEntry);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'Import record updated successfully!';
      setTimeout(() => this.router.navigate(['/import-duty']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/import-duty/view', this.recordId]); }
}