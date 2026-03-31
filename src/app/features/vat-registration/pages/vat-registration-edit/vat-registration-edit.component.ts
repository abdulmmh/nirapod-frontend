import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatRegistration } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-edit',
  templateUrl: './vat-registration-edit.component.html',
  styleUrls: ['./vat-registration-edit.component.css']
})
export class VatRegistrationEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  vatId      = 0;

  vatCategories      = ['Standard', 'Zero Rated', 'Exempt', 'Special'];
  businessTypes      = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'NGO', 'Other'];
  businessCategories = ['Manufacturing', 'Trading', 'Service', 'Agriculture', 'Construction', 'IT', 'Healthcare', 'Education', 'Other'];
  statuses           = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];
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

  form: any = {};

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.vatId,
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.', ownerName: 'Abdul Rahman',
      vatCategory: 'Standard', businessType: 'Private Limited',
      businessCategory: 'Manufacturing', tradeLicenseNo: 'TL-44821',
      registrationDate: '2024-01-10', effectiveDate: '2024-01-15',
      expiryDate: '2025-01-15', annualTurnover: 5000000,
      email: 'rahman@textile.com', phone: '01711-111111',
      address: 'Mirpur DOHS, Dhaka', district: 'Dhaka', division: 'Dhaka',
      vatZone: 'VAT Zone-1', vatCircle: 'Circle-5',
      status: 'Active', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.businessName && this.form.tinNumber &&
              this.form.vatCategory && this.form.phone &&
              this.form.vatZone && this.form.vatCircle);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'VAT Registration updated successfully!';
      setTimeout(() => this.router.navigate(['/vat-registration']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/vat-registration/view', this.vatId]); }
}