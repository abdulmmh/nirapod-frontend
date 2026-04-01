import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImportDutyCreateRequest } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-create',
  templateUrl: './import-duty-create.component.html',
  styleUrls: ['./import-duty-create.component.css']
})
export class ImportDutyCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  ports    = ['Chittagong Port', 'Dhaka Air Freight', 'Benapole Land Port', 'Dhaka ICD', 'Mongla Port', 'Sonamsjid Land Port', 'Hili Land Port'];
  statuses = ['Draft', 'Pending', 'Assessed'];

  countries = ['China', 'India', 'Japan', 'USA', 'Germany', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Other'];

  // Dropdowns from system
  taxpayers = [
    { tin: 'TIN-1001', name: 'Abdul Rahman', business: 'Rahman Textile Ltd.' },
    { tin: 'TIN-1002', name: 'Karim Uddin',  business: 'Karim Traders' },
    { tin: 'TIN-1003', name: 'Dr. Nasrin Islam', business: 'Dhaka Pharma Co.' },
    { tin: 'TIN-1004', name: 'Faruk Hossain', business: 'Chittagong Exports' },
    { tin: 'TIN-1006', name: 'Imran Ahmed', business: 'BD Tech Solutions' },
  ];

  products = [
    { id: 1, name: 'Mobile Phone',          hsCode: '8517.12.00', rate: 25 },
    { id: 2, name: 'Woven Fabric',           hsCode: '5208.11.10', rate: 5  },
    { id: 3, name: 'Passenger Car',          hsCode: '8703.23.10', rate: 25 },
    { id: 4, name: 'Pharmaceutical Drug',    hsCode: '3004.90.99', rate: 0  },
    { id: 5, name: 'Cigarettes',             hsCode: '2402.20.10', rate: 65 },
    { id: 6, name: 'Industrial Machinery',   hsCode: '8428.90.00', rate: 5  },
    { id: 7, name: 'Perfume',                hsCode: '3303.00.00', rate: 25 },
    { id: 8, name: 'Rice',                   hsCode: '1006.30.00', rate: 0  },
  ];

  selectedProduct: any  = null;
  selectedTaxpayer: any = null;

  form: ImportDutyCreateRequest = {
    tinNumber: '', taxpayerName: '', businessName: '',
    productId: 0, goodsDescription: '',
    originCountry: '', cifValue: 0, dutyRate: 0,
    portOfEntry: '', billOfLading: '',
    importDate: new Date().toISOString().split('T')[0],
    status: 'Draft', remarks: ''
  };

  onTaxpayerChange(): void {
    const tp = this.taxpayers.find(t => t.tin === this.form.tinNumber);
    if (tp) {
      this.form.taxpayerName = tp.name;
      this.form.businessName = tp.business;
      this.selectedTaxpayer = tp;
    }
  }

  onProductChange(): void {
    const p = this.products.find(p => p.id === Number(this.form.productId));
    if (p) {
      this.selectedProduct = p;
      this.form.dutyRate = p.rate;
    }
  }

  get dutyAmount(): number {
    return Math.round(this.form.cifValue * this.form.dutyRate / 100);
  }

  get vatOnImport(): number {
    return Math.round((this.form.cifValue + this.dutyAmount) * 0.15);
  }

  get totalPayable(): number {
    return this.dutyAmount + this.vatOnImport;
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.productId &&
              this.form.cifValue > 0 && this.form.portOfEntry &&
              this.form.importDate);
  }

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = 'Import duty record created successfully!';
      setTimeout(() => this.router.navigate(['/import-duty']), 1500);
    }, 800);
  }

  onReset(): void {
    this.form = { tinNumber: '', taxpayerName: '', businessName: '', productId: 0, goodsDescription: '', originCountry: '', cifValue: 0, dutyRate: 0, portOfEntry: '', billOfLading: '', importDate: new Date().toISOString().split('T')[0], status: 'Draft', remarks: '' };
    this.selectedProduct = null; this.selectedTaxpayer = null;
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/import-duty']); }
}