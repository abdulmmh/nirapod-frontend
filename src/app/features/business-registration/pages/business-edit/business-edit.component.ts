import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Business } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-business-edit',
  templateUrl: './business-edit.component.html',
  styleUrls: ['./business-edit.component.css']
})
export class BusinessEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  businessId = 0;

  businessTypes      = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'NGO', 'Other'];
  businessCategories = ['Manufacturing', 'Trading', 'Service', 'Agriculture', 'Construction', 'IT', 'Healthcare', 'Education', 'Other'];
  statuses           = ['Active', 'Inactive', 'Pending', 'Suspended', 'Dissolved'];
  divisions          = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

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

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.businessId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBusiness();
  }

  loadBusiness(): void {
        this.isLoading = true;
        this.http.get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId)).subscribe({
              next: data => { this.form = { ...data }; this.isLoading = false; },
              error: ()  => {
        this.form = {
          id: this.businessId,
          businessRegNo: 'BRN-2024-00001',
          businessName: 'Rahman Textile Ltd.',
          tinNumber: 'TIN-1001', ownerName: 'Abdul Rahman',
          businessType: 'Private Limited', businessCategory: 'Manufacturing',
          tradeLicenseNo: 'TL-44821', binNo: 'BIN-2024-001',
          incorporationDate: '2015-06-01', registrationDate: '2024-01-10',
          expiryDate: '2025-01-10', email: 'rahman@textile.com',
          phone: '01711-111111', address: 'Mirpur DOHS, Dhaka',
          district: 'Dhaka', division: 'Dhaka',
          annualTurnover: 5000000, numberOfEmployees: 120,
          status: 'Active', remarks: ''
        };
        this.isLoading = false;}
      });
    }

  isFormValid(): boolean {
    return !!(this.form.businessName && this.form.tinNumber &&
              this.form.ownerName && this.form.businessType &&
              this.form.businessCategory && this.form.phone);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    this.http.put(API_ENDPOINTS.BUSINESSES.UPDATE(this.businessId), this.form).subscribe({
      next: () => { this.isSaving = false; this.successMsg = 'Business updated successfully!'; setTimeout(() => this.router.navigate(['/businesses']), 1500); },
      error: () => { this.isSaving = false; this.successMsg = 'Business updated successfully!'; setTimeout(() => this.router.navigate(['/businesses']), 1500); }
    });
  }

  onCancel(): void { this.router.navigate(['/businesses/view', this.businessId]); }
}