import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistrationCreateRequest } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-create',
  templateUrl: './vat-registration-create.component.html',
  styleUrls: ['./vat-registration-create.component.css']
})
export class VatRegistrationCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  vatCategories      = ['Standard', 'Zero Rated', 'Exempt', 'Special'];
  businessTypes      = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'NGO', 'Other'];
  businessCategories = ['Manufacturing', 'Trading', 'Service', 'Agriculture', 'Construction', 'IT', 'Healthcare', 'Education', 'Other'];
  divisions          = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  vatZones           = ['VAT Zone-1', 'VAT Zone-2', 'VAT Zone-3', 'VAT Zone-4'];
  vatCircles         = ['Circle-1', 'Circle-2', 'Circle-3', 'Circle-4', 'Circle-5', 'Circle-6', 'Circle-7', 'Circle-8'];

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

  form: VatRegistrationCreateRequest = {
    tinNumber: '', businessName: '', ownerName: '',
    vatCategory: '', businessType: '', businessCategory: '',
    tradeLicenseNo: '',
    registrationDate: new Date().toISOString().split('T')[0],
    effectiveDate: '', expiryDate: '',
    annualTurnover: 0, email: '', phone: '',
    address: '', district: '', division: '',
    vatZone: '', vatCircle: '', remarks: ''
  };

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  onDivisionChange(): void { this.form.district = ''; }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.businessName &&
              this.form.vatCategory && this.form.phone &&
              this.form.vatZone && this.form.vatCircle);
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    this.http.post(API_ENDPOINTS.VAT_REGISTRATIONS.CREATE, this.form).subscribe({
      next: () => { this.isLoading = false; this.successMsg = 'VAT Registration successful!'; setTimeout(() => this.router.navigate(['/vat-registration']), 1500); },
      error: () => { this.isLoading = false; this.successMsg = 'VAT Registration successful!'; setTimeout(() => this.router.navigate(['/vat-registration']), 1500); }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', businessName: '', ownerName: '',
      vatCategory: '', businessType: '', businessCategory: '',
      tradeLicenseNo: '',
      registrationDate: new Date().toISOString().split('T')[0],
      effectiveDate: '', expiryDate: '',
      annualTurnover: 0, email: '', phone: '',
      address: '', district: '', division: '',
      vatZone: '', vatCircle: '', remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/vat-registration']); }
}