import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatReturn } from '../../../../models/vat-return.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-vat-return-edit',
  templateUrl: './vat-return-edit.component.html',
  styleUrls: ['./vat-return-edit.component.css']
})
export class VatReturnEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  vatId      = 0;

  returnPeriods   = ['Monthly', 'Quarterly', 'Annually'];
  months          = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  quarters        = ['Q1', 'Q2', 'Q3', 'Q4'];
  years           = ['2024', '2023', '2022', '2021'];
  assessmentYears = ['2024-25', '2023-24', '2022-23'];
  statuses        = ['Draft', 'Submitted', 'Accepted', 'Rejected', 'Overdue', 'Amended'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  form: any = {};
  private fallbackData: VatReturn[] = [
    {
      id: 1, returnNo: 'VRT-2024-00001',
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.',
      returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024',
      taxableSupplies: 500000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 500000, outputTax: 75000, inputTax: 30000,
      netTaxPayable: 45000, taxPaid: 45000,
      submissionDate: '2024-02-12', dueDate: '2024-02-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Taxpayer', remarks: '', actionHistory: []
    },
    {
      id: 4, returnNo: 'VRT-2024-00004',
      binNo: 'BIN-2024-001006', tinNumber: 'TIN-1006',
      businessName: 'BD Tech Solutions',
      returnPeriod: 'Quarterly', periodMonth: 'Q1', periodYear: '2024',
      taxableSupplies: 650000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 650000, outputTax: 97500, inputTax: 40000,
      netTaxPayable: 57500, taxPaid: 0,
      submissionDate: '2024-04-10', dueDate: '2024-04-15',
      assessmentYear: '2024-25', status: 'Submitted',
      submittedBy: 'Taxpayer', remarks: '', actionHistory: []
    }
  ];

  get periodOptions(): string[] {
    return this.form.returnPeriod === 'Quarterly' ? this.quarters : this.months;
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.outputTax || 0) - (this.form.inputTax || 0));
  }

  get totalSupplies(): number {
    return (this.form.taxableSupplies || 0) +
           (this.form.exemptSupplies || 0) +
           (this.form.zeroRatedSupplies || 0);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<VatReturn>(API_ENDPOINTS.VAT_RETURNS.GET(this.vatId)).subscribe({
      next: (data) => {
        this.form = { ...data };
        this.isLoading = false;
      },
      error: () => {
        const fallback = this.fallbackData.find((item) => item.id === this.vatId) || this.fallbackData[0];
        this.form = { ...fallback };
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.form.binNo && this.form.tinNumber &&
              this.form.businessName && this.form.returnPeriod &&
              this.form.periodMonth);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';
    const payload = {
      ...this.form,
      totalSupplies: this.totalSupplies,
      netTaxPayable: this.netTaxPayable
    };
    this.http.put(API_ENDPOINTS.VAT_RETURNS.UPDATE(this.vatId), payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = 'VAT return updated successfully!';
        setTimeout(() => this.router.navigate(['/vat-returns/view', this.vatId]), 1200);
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'Failed to update VAT return. Please try again.';
      }
    });
  }

  onReset(): void {
    this.ngOnInit();
  }

  onCancel(): void { this.router.navigate(['/vat-returns/view', this.vatId]); }
}
