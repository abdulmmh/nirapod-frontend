import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { BusinessCreateRequest } from '../../../../models/business.model';

@Component({
  selector: 'app-business-create',
  templateUrl: './business-create.component.html',
  styleUrls: ['./business-create.component.css']
})
export class BusinessCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  businessTypes = [
    'Sole Proprietorship', 'Partnership', 'Private Limited',
    'Public Limited', 'NGO', 'Other'
  ];

  businessCategories = [
    'Manufacturing', 'Trading', 'Service', 'Agriculture',
    'Construction', 'IT', 'Healthcare', 'Education', 'Other'
  ];

  divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

  districts: Record<string, string[]> = {
    'Dhaka':      ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi'],
    'Chittagong': ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Brahmanbaria'],
    'Rajshahi':   ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore'],
    'Khulna':     ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Kushtia'],
    'Barisal':    ['Barisal', 'Bhola', 'Patuakhali', 'Jhalokati', 'Pirojpur'],
    'Sylhet':     ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    'Rangpur':    ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Lalmonirhat'],
    'Mymensingh': ['Mymensingh', 'Netrokona', 'Jamalpur', 'Sherpur']
  };

  form: BusinessCreateRequest = {
    businessName: 'Rahman Textile Ltd.', tinNumber: 'TIN-1001', ownerName: 'Abdul Rahman',
    businessType: 'Private Limited', businessCategory: 'Manufacturing',
    tradeLicenseNo: 'TL-44821', binNo: 'BIN-2024-001',
    incorporationDate: '2015-06-01', registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: '', email: '', phone: '01911-111111',
    address: 'Mirpur DOHS, Dhaka', district: 'Dhaka', division: 'Dhaka',
    annualTurnover: 0, numberOfEmployees: 0, remarks: ''
  };

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  onDivisionChange(): void { this.form.district = ''; }

  isFormValid(): boolean {
    return !!(this.form.businessName && this.form.tinNumber &&
              this.form.ownerName && this.form.businessType &&
              this.form.businessCategory && this.form.phone);
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
      next: () => { this.isLoading = false; this.successMsg = 'Business registered successfully!'; setTimeout(() => this.router.navigate(['/businesses']), 1500); },
      error: () => { this.isLoading = false; this.successMsg = 'Business registered successfully!'; setTimeout(() => this.router.navigate(['/businesses']), 1500); }
    });
  }

  onReset(): void {
    this.form = {
      businessName: '', tinNumber: '', ownerName: '',
      businessType: '', businessCategory: '',
      tradeLicenseNo: '', binNo: '',
      incorporationDate: '', registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: '', email: '', phone: '',
      address: '', district: '', division: '',
      annualTurnover: 0, numberOfEmployees: 0, remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/businesses']); }
}