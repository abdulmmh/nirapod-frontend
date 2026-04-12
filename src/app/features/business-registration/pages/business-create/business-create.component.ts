import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { BusinessCreateRequest } from 'src/app/models/business.model';


@Component({
  selector: 'app-business-create',
  templateUrl: './business-create.component.html',
  styleUrls: ['./business-create.component.css'],
})
export class BusinessCreateComponent implements OnInit, OnDestroy {

  isLoading = false;
  form: BusinessCreateRequest = this.getEmptyForm();

  private destroy$ = new Subject<void>();

  // Dropdown data
  activeTaxpayers:    any[] = [];
  divisions:          any[] = [];
  districts:          any[] = [];
  businessTypes:      any[] = [];
  businessCategories: any[] = [];

  constructor(
    private http:       HttpClient,
    private router:     Router,
    private toast:      ToastService,
    private masterData: MasterDataService,
  ) {}

  // ──────────────── Lifecycle ────────────────

  ngOnInit(): void { this.loadInitialData(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────── Load Master Data ────────────────

  loadInitialData(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.divisions = data,
        error: () => this.toast.error('Failed to load divisions.')
      });

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.businessTypes = data,
        error: () => this.toast.error('Failed to load business types.')
      });

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.businessCategories = data,
        error: () => this.toast.error('Failed to load categories.')
      });

    this.masterData.getActiveTaxpayers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.activeTaxpayers = data,
        error: () => this.toast.error('Failed to load taxpayers.')
      });
  }

  // ──────────────── Form Factory ────────────────

  private getEmptyForm(): BusinessCreateRequest {
    return {
      taxpayerId:         0,
      businessName:       '',
      tinNumber:          '',
      ownerName:          '',
      businessTypeId:     0,   
      businessCategoryId: 0,   
      tradeLicenseNo:     '',
      binNo:              '',
      incorporationDate:  '',
      registrationDate:   new Date().toISOString().split('T')[0],
      expiryDate:         '',
      email:              '',
      phone:              '',
      address:            '',
      divisionId:         0,
      districtId:         0,
      annualTurnover:     0,
      numberOfEmployees:  0,
      remarks:            '',
    };
  }

  // ──────────────── Event Handlers ────────────────

  onDivisionChange(): void {
    this.form.districtId = 0;
    this.districts = [];

    if (this.form.divisionId) {
      this.masterData.getDistrictsByDivision(this.form.divisionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => this.districts = data,
          error: () => this.toast.error('Failed to load districts.')
        });
    }
  }

  onTaxpayerChange(): void {
    const selected = this.activeTaxpayers.find(
      t => t.id === Number(this.form.taxpayerId)
    );
    if (selected) {
      this.form.tinNumber = selected.tinNumber || '';
      this.form.ownerName = selected.fullName  || '';
    }
  }

  // ──────────────── Validation ────────────────

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerId         &&
      this.form.businessName       &&
      this.form.tinNumber          &&
      this.form.ownerName          &&
      this.form.businessTypeId     &&   
      this.form.businessCategoryId &&   
      this.form.phone              &&
      this.form.divisionId         &&
      this.form.districtId         &&
      this.form.registrationDate
    ) && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  // ──────────────── Submit ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields with valid values.');
      return;
    }
    this.isLoading = true;
    this.createBusiness();
  }

  private createBusiness(): void {
    
    const payload = {
      businessName:      this.form.businessName,
      tinNumber:         this.form.tinNumber,
      ownerName:         this.form.ownerName,
      tradeLicenseNo:    this.form.tradeLicenseNo,
      binNo:             this.form.binNo,
      incorporationDate: this.form.incorporationDate || null,
      registrationDate:  this.form.registrationDate,
      expiryDate:        this.form.expiryDate || null,
      email:             this.form.email,
      phone:             this.form.phone,
      address:           this.form.address,
      annualTurnover:    this.form.annualTurnover,
      numberOfEmployees: this.form.numberOfEmployees,
      remarks:           this.form.remarks,

      
      taxpayer:         { id: this.form.taxpayerId },
      division:         { id: this.form.divisionId },
      district:         { id: this.form.districtId },
      businessType:     { id: this.form.businessTypeId },      
      businessCategory: { id: this.form.businessCategoryId },  
    };

    this.http.post(API_ENDPOINTS.BUSINESSES.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next:  () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
  }

  private handleSuccess(): void {
    this.toast.success('Business registered successfully!');
    setTimeout(() => this.router.navigate(['/businesses']), 1500);
  }

  private handleError(error: unknown): void {
    console.error('Error creating business:', error);
    this.toast.error('Failed to create business. Please try again.');
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.districts = [];
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/businesses']);
  }
}