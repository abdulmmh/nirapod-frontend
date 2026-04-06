import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';

@Component({
  selector: 'app-taxpayer-edit',
  templateUrl: './taxpayer-edit.component.html',
  styleUrls: ['./taxpayer-edit.component.css']
})
export class TaxpayerEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  taxpayerId = 0;

  statuses       = ['Active', 'Inactive', 'Pending', 'Suspended'];
  taxpayerTypes  = ['Individual', 'Business', 'Company'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.taxpayerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTaxpayer();
  }

  loadTaxpayer(): void {
    this.isLoading = true;
    this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId)).subscribe({
      next: data => { this.form = { ...data }; this.isLoading = false; },
      error: ()  => {
        this.form = {
          id: this.taxpayerId,
          tin: 'TIN-1001', fullName: 'Abdul Karim',
          email: 'abdul.karim@example.com', phone: '01711111111',
          taxpayerType: 'Individual', status: 'Active',
          registrationDate: '2024-01-10', address: 'Mirpur, Dhaka',
          nationalId: '1234567890123', dateOfBirth: '1985-03-15'
        };
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.form.tin && this.form.fullName &&
              this.form.phone && this.form.taxpayerType);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    this.http.put(API_ENDPOINTS.TAXPAYERS.UPDATE(this.taxpayerId), this.form).subscribe({
      next: () => { this.isSaving = false; this.successMsg = 'Taxpayer updated successfully!'; setTimeout(() => this.router.navigate(['/taxpayers']), 1500); },
     error: (err) => {
        console.error('Update failed', err);
        this.isSaving = false;
        this.errorMsg = 'Failed to update taxpayer.';
      }
    });
  }

  onCancel(): void { this.router.navigate(['/taxpayers', 'view', this.taxpayerId]); }
}