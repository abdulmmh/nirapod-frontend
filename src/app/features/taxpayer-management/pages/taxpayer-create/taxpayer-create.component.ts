import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TaxpayerCreateRequest } from '../../../../models/taxpayer.model';
import { TaxpayerService } from 'src/app/core/services/taxpayer.service';

@Component({
  selector: 'app-taxpayer-create',
  templateUrl: './taxpayer-create.component.html',
  styleUrls: ['./taxpayer-create.component.css']
})
export class TaxpayerCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  form: TaxpayerCreateRequest = {
    tin:              'TIN-2026-1001',
    fullName:         'Abdul Karim',
    email:            'abdulkarim@example.com',
    phone:            '01912345678',
    taxpayerType:     'Individual',
    status:           'Active',
    registrationDate: new Date().toISOString().split('T')[0],
    address:          'Rampura, Dhaka',
    dateOfBirth:      '12/05/1985',
    nationalId:       '958-123456-7890'
  };

  constructor(private http: HttpClient, private router: Router, private taxpayerService: TaxpayerService) {}

  isFormValid(): boolean {
    return !!(
      this.form.tin          &&
      this.form.fullName     &&
      this.form.email        &&
      this.form.phone        &&
      this.form.taxpayerType &&
      this.form.nationalId
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    // this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
    //   next: () => {
    //     this.isLoading  = false;
    //     this.successMsg = 'Taxpayer registered successfully!';
    //     setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
    //   },
    //   error: () => {
    //     // Mock success when API unavailable
    //     this.isLoading  = false;
    //     this.successMsg = 'Taxpayer registered successfully!';
    //     setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
    //   }
    // });
    this.taxpayerService.createTaxpayer(this.form).subscribe({
      next: (res) => {
        alert('Taxpayer registered successfully!');
        console.log('Created successfully', res);
        this.router.navigate(['/taxpayers']);
      },
      error: (err) => {
        alert('Failed to register taxpayer. Please try again.');
        console.error('Create failed', err);
      }
    });
  }

  onReset(): void {
    this.form = {
      tin:              'TIN-2026-1001',
      fullName:         'Abdul Karim',
      email:            'abdulkarim@example.com',
      phone:            '01912345678',
      taxpayerType:     'Individual',
      status:           'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      address:          'Rampura, Dhaka',
      dateOfBirth:      '12/05/1985',
      nationalId:       '958-123456-7890'
    };
    this.errorMsg   = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers']);
  }
}