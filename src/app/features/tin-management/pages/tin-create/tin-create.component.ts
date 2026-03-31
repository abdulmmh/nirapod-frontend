import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TinCreateRequest } from '../../../../models/tin.model';

@Component({
  selector: 'app-tin-create',
  templateUrl: './tin-create.component.html',
  styleUrls: ['./tin-create.component.css']
})
export class TinCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
  divisions     = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  taxZones      = ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4', 'Zone-5', 'Zone-6'];
  taxCircles    = ['Circle-1', 'Circle-2', 'Circle-3', 'Circle-4', 'Circle-5', 'Circle-6', 'Circle-7', 'Circle-8'];

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

  form: TinCreateRequest = {
    taxpayerName: '', tinCategory: '',
    nationalId: '', passportNo: '',
    dateOfBirth: '', incorporationDate: '',
    email: '', phone: '', address: '',
    district: '', division: '',
    taxZone: '', taxCircle: '',
    issuedDate: new Date().toISOString().split('T')[0],
    remarks: ''
  };

  get isIndividual(): boolean {
    return this.form.tinCategory === 'Individual';
  }

  get isCompany(): boolean {
    return ['Company', 'Partnership', 'NGO', 'Government'].includes(this.form.tinCategory);
  }

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  onDivisionChange(): void { this.form.district = ''; }

  isFormValid(): boolean {
    return !!(this.form.taxpayerName && this.form.tinCategory &&
              this.form.phone && this.form.taxZone && this.form.taxCircle);
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
      next: () => { this.isLoading = false; this.successMsg = 'TIN issued successfully!'; setTimeout(() => this.router.navigate(['/tin']), 1500); },
      error: () => { this.isLoading = false; this.successMsg = 'TIN issued successfully!'; setTimeout(() => this.router.navigate(['/tin']), 1500); }
    });
  }

  onReset(): void {
    this.form = {
      taxpayerName: '', tinCategory: '', nationalId: '',
      passportNo: '', dateOfBirth: '', incorporationDate: '',
      email: '', phone: '', address: '', district: '', division: '',
      taxZone: '', taxCircle: '',
      issuedDate: new Date().toISOString().split('T')[0], remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/tin']); }
}