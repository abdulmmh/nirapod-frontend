import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import {
  Division, District, BusinessType, BusinessCategory
} from '../../../../models/master-data.model';

@Component({
  selector: 'app-vat-registration-edit',
  templateUrl: './vat-registration-edit.component.html',
  styleUrls: ['./vat-registration-edit.component.css']
})
export class VatRegistrationEditComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading = true;
  isSaving  = false;
  vatId     = 0;
  binNo     = '';
  businessName = '';

  private destroy$ = new Subject<void>();

  // ── Static dropdown ──────────────────────────────────────────────────────
  vatCategories = ['Standard', 'Zero Rated', 'Exempt', 'Special'];
  statuses      = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];

  // ── Dynamic dropdowns ────────────────────────────────────────────────────
  divisions:          Division[]         = [];
  districts:          District[]         = [];
  businessTypes:      BusinessType[]     = [];
  businessCategories: BusinessCategory[] = [];
  vatZones:   any[] = [];
  vatCircles: any[] = [];

  loadingDistricts = false;
  loadingZones     = false;
  loadingCircles   = false;

  constructor(
    private fb:         FormBuilder,
    private route:      ActivatedRoute,
    private router:     Router,
    private http:       HttpClient,
    private toast:      ToastService,
    private masterData: MasterDataService
  ) {}

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadStaticDropdowns();
    // Data load triggers cascade restore after static dropdowns ready
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      tinNumber:         ['', Validators.required],
      businessName:      ['', Validators.required],
      ownerName:         [''],
      vatCategory:       ['', Validators.required],
      businessTypeId:    [null],
      businessCategoryId:[null],
      tradeLicenseNo:    [''],
      status:            ['Active'],
      divisionId:        [null],
      districtId:        [null],
      vatZoneId:         [null, Validators.required],
      vatCircleId:       [null, Validators.required],
      registrationDate:  [''],
      effectiveDate:     [''],
      expiryDate:        [''],
      annualTurnover:    [0],
      email:             ['', Validators.email],
      phone:             ['', Validators.required],
      address:           [''],
      remarks:           ['']
    });
  }

  ctrl(name: string) { return this.form.get(name); }

  // ── Load static dropdowns ─────────────────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.divisions = data);

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.businessTypes = data);

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.businessCategories = data);
  }

  // ── Load existing record and restore cascade ──────────────────────────────

  private loadData(): void {
    this.isLoading = true;
    this.http.get<VatRegistration>(API_ENDPOINTS.VAT_REGISTRATIONS.GET(this.vatId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.binNo        = data.binNo;
          this.businessName = data.businessName;

          // Patch non-cascade fields first
          this.form.patchValue({
            tinNumber:         data.tinNumber,
            businessName:      data.businessName,
            ownerName:         data.ownerName,
            vatCategory:       data.vatCategory,
            businessTypeId:    (data as any).businessTypeId    ?? null,
            businessCategoryId:(data as any).businessCategoryId ?? null,
            tradeLicenseNo:    data.tradeLicenseNo,
            status:            data.status,
            registrationDate:  data.registrationDate,
            effectiveDate:     data.effectiveDate,
            expiryDate:        data.expiryDate,
            annualTurnover:    data.annualTurnover,
            email:             data.email,
            phone:             data.phone,
            address:           data.address,
            remarks:           data.remarks
          });

          // Restore cascade: Division → Districts → patch districtId
          //                  District → Zones → patch vatZoneId
          //                  Zone → Circles → patch vatCircleId
          const divisionId  = (data as any).divisionId  ?? null;
          const districtId  = (data as any).districtId  ?? null;
          const vatZoneId   = (data as any).vatZoneId   ?? null;
          const vatCircleId = (data as any).vatCircleId ?? null;

          if (divisionId) {
            this.form.patchValue({ divisionId });
            this.loadingDistricts = true;
            this.masterData.getDistrictsByDivision(divisionId)
              .pipe(takeUntil(this.destroy$), finalize(() => this.loadingDistricts = false))
              .subscribe(districts => {
                this.districts = districts;
                if (districtId) {
                  this.form.patchValue({ districtId });
                  this.loadingZones = true;
                  this.masterData.getTaxZonesByDistrict(districtId)
                    .pipe(takeUntil(this.destroy$), finalize(() => this.loadingZones = false))
                    .subscribe(zones => {
                      this.vatZones = zones;
                      if (vatZoneId) {
                        this.form.patchValue({ vatZoneId });
                        this.loadingCircles = true;
                        this.masterData.getTaxCirclesByZone(vatZoneId)
                          .pipe(takeUntil(this.destroy$), finalize(() => this.loadingCircles = false))
                          .subscribe(circles => {
                            this.vatCircles = circles;
                            if (vatCircleId) {
                              this.form.patchValue({ vatCircleId });
                            }
                          });
                      }
                    });
                }
              });
          }
        },
        error: () => {
          this.toast.error('Failed to load VAT registration data.');
          this.router.navigate(['/vat-registration']);
        }
      });
  }

  // ── Manual cascade (when user changes dropdowns) ──────────────────────────

  onDivisionChange(): void {
    const divisionId = this.ctrl('divisionId')?.value;
    this.districts  = [];
    this.vatZones   = [];
    this.vatCircles = [];
    this.form.patchValue({ districtId: null, vatZoneId: null, vatCircleId: null });

    if (!divisionId) return;

    this.loadingDistricts = true;
    this.masterData.getDistrictsByDivision(divisionId)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingDistricts = false))
      .subscribe(data => this.districts = data);
  }

  onDistrictChange(): void {
    const districtId = this.ctrl('districtId')?.value;
    this.vatZones   = [];
    this.vatCircles = [];
    this.form.patchValue({ vatZoneId: null, vatCircleId: null });

    if (!districtId) return;

    this.loadingZones = true;
    this.masterData.getTaxZonesByDistrict(districtId)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingZones = false))
      .subscribe(data => this.vatZones = data);
  }

  onZoneChange(): void {
    const zoneId = this.ctrl('vatZoneId')?.value;
    this.vatCircles = [];
    this.form.patchValue({ vatCircleId: null });

    if (!zoneId) return;

    this.loadingCircles = true;
    this.masterData.getTaxCirclesByZone(zoneId)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loadingCircles = false))
      .subscribe(data => this.vatCircles = data);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;

    this.http.put(API_ENDPOINTS.VAT_REGISTRATIONS.UPDATE(this.vatId), this.form.value)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Registration updated successfully!');
          setTimeout(() => this.router.navigate(['/vat-registration/view', this.vatId]), 1500);
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'Conflict: duplicate registration detected.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to update VAT registration. Please try again.');
          }
        }
      });
  }

  onCancel(): void { this.router.navigate(['/vat-registration/view', this.vatId]); }
}
