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
    dateOfBirth:      '2000-04-22',
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
        console.log('Created successfully', res);
        alert('Taxpayer created successfully');
        this.router.navigate(['/taxpayers']);
      },
      error: (err) => {
        console.error('Create failed', err);
        this.isLoading = false;

        if (err.status === 400) {
          alert('Invalid input. Please check the form.');
        } else if (err.status === 409) {
          alert('TIN or Email already exists.');
        } else {
          alert('Create failed. Please try again.');
        }
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
      dateOfBirth:      '2000-04-22',
      nationalId:       '958-123456-7890'
    };
    this.errorMsg   = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers']);
  }
}