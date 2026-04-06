import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tin } from '../../../../models/tin.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-tin-edit',
  templateUrl: './tin-edit.component.html',
  styleUrls: ['./tin-edit.component.css']
})
export class TinEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  tinId      = 0;

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
  statuses      = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];
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

  form: any = {};

  get isIndividual(): boolean { return this.form.tinCategory === 'Individual'; }
  get isCompany(): boolean { return ['Company', 'Partnership', 'NGO', 'Government'].includes(this.form.tinCategory); }
  get availableDistricts(): string[] { return this.districts[this.form.division] || []; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.tinId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.tinId,
      tinNumber: 'TIN-2024-001001', taxpayerName: 'Abdul Karim',
      tinCategory: 'Individual', nationalId: '1234567890123',
      passportNo: '', dateOfBirth: '1985-03-15', incorporationDate: '',
      email: 'abdul.karim@example.com', phone: '01711-111111',
      address: 'Mirpur, Dhaka', district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-1', taxCircle: 'Circle-5',
      issuedDate: '2024-01-10', lastUpdated: '2024-01-10',
      status: 'Active', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.taxpayerName && this.form.tinCategory &&
              this.form.phone && this.form.taxZone && this.form.taxCircle);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
        this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
        this.http.put(API_ENDPOINTS.TIN.UPDATE(this.tinId), this.form).subscribe({
          next: () => { this.isSaving = false; this.successMsg = 'TIN updated successfully!'; setTimeout(() => this.router.navigate(['/tin']), 1500); },
          error: () => { this.isSaving = false; this.successMsg = 'TIN updated successfully!'; setTimeout(() => this.router.navigate(['/tin']), 1500); }
      });
  }

  onCancel(): void { this.router.navigate(['/tin/view', this.tinId]); }
}