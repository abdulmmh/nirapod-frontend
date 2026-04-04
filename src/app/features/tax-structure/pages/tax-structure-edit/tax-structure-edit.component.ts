import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TaxStructure } from '../../../../models/tax-structure.model';

@Component({
  selector: 'app-tax-structure-edit',
  templateUrl: './tax-structure-edit.component.html',
  styleUrls: ['./tax-structure-edit.component.css']
})
export class TaxStructureEditComponent implements OnInit {

  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  taxId = 0;

  taxTypes = ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'];
  applicables = ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'];
  statuses = ['Active', 'Inactive', 'Expired'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.taxId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTaxStructure();
  }

  loadTaxStructure(): void {
    this.isLoading = true;

    this.http.get<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.GET(this.taxId)).subscribe({
      next: (data) => {
        this.form = { ...data };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load failed:', err);
        this.errorMsg = 'Failed to load tax structure.';
        this.isLoading = false;
      }
    });
  }

  get ratePreview(): number {
    return Math.round((100000 * (this.form.rate || 0)) / 100);
  }

  isFormValid(): boolean {
    return !!(
      this.form.taxCode &&
      this.form.taxName &&
      this.form.taxType &&
      this.form.rate > 0 &&
      this.form.effectiveDate
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.put(API_ENDPOINTS.TAX_STRUCTURES.UPDATE(this.taxId), this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = 'Tax structure updated successfully!';
        setTimeout(() => this.router.navigate(['/tax-structure/view', this.taxId]), 1500);
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.isSaving = false;
        this.errorMsg = 'Tax structure update failed.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tax-structure/view', this.taxId]);
  }
}