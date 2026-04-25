import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { TaxpayerType } from 'src/app/models/master-data.model';

@Component({
  selector: 'app-taxpayer-create',
  templateUrl: './taxpayer-create.component.html',
  styleUrls: ['./taxpayer-create.component.css'],
})
export class TaxpayerCreateComponent implements OnInit, OnDestroy {
  taxpayerForm!: FormGroup;
  isLoading = false;

  // Master Data Arrays
  taxpayerTypes: TaxpayerType[] = [];
  divisions: any[] = [];
  presentDistricts: any[] = [];
  permanentDistricts: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private masterData: MasterDataService,
  ) {}

  // ───────────── Lifecycle ─────────────

  ngOnInit(): void {
    this.initForm();
    this.setupConditionalLogic();
    this.loadTaxpayerTypes();
    this.loadDivisions();
    this.setupAddressDropdownLogic();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────── Form Initialization ─────────────

  private initForm(): void {
    const addressGroup = () =>
      this.fb.group({
        division: ['', Validators.required],
        district: ['', Validators.required],
        thana: ['', Validators.required],
        roadVillage: [''],
      });

    this.taxpayerForm = this.fb.group({
      taxpayerType: [null, Validators.required],
      registrationDate: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],

      // Individual Fields
      fullName: [''],
      nid: [''],
      fathersName: [''],
      mothersName: [''],
      dateOfBirth: [''],
      profession: [''],

      // Company Fields
      companyName: [''],
      incorporationDate: [''],
      tradeLicenseNo: [''],
      rjscNo: [''],
      natureOfBusiness: [''],
      authorizedPersonName: [''],
      authorizedPersonNid: [''],
      authorizedPersonDesignation: [''],

      // Contact & Address
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      presentAddress: addressGroup(),
      permanentAddress: addressGroup(),
      sameAsPermanent: [false],

      status: ['Active', Validators.required],
    });
  }

  // ───────────── Conditional Logic ─────────────

  private setupConditionalLogic(): void {
    // 1. Same As Permanent Address Logic
    this.taxpayerForm
      .get('sameAsPermanent')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((isSame) => {
        const permanentGroup = this.taxpayerForm.get('permanentAddress');
        if (isSame) {
          permanentGroup?.disable();
          permanentGroup?.patchValue(
            this.taxpayerForm.get('presentAddress')?.value,
          );
        } else {
          permanentGroup?.enable();
          permanentGroup?.reset();
        }
      });

    this.taxpayerForm
      .get('presentAddress')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (this.taxpayerForm.get('sameAsPermanent')?.value) {
          this.taxpayerForm
            .get('permanentAddress')
            ?.patchValue(val, { emitEvent: false });
        }
      });

    // 2. Individual vs Company Logic (Updated with includes)
    this.taxpayerForm
      .get('taxpayerType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type: TaxpayerType) => {
        const category = type?.category;

        const isIndividual = category === 'Individual';
        const isCompanyOrOrg =
          category === 'Business' || category === 'Organization';
        const isBusiness = category === 'Business';

        const individualControls = [
          'fullName',
          'nid',
          'fathersName',
          'mothersName',
          'dateOfBirth',
          'profession',
        ];
        const companyControls = [
          'companyName',
          'natureOfBusiness',
          'authorizedPersonName',
          'authorizedPersonNid',
          'authorizedPersonDesignation',
        ];
        const businessOnlyControls = [
          'tradeLicenseNo',
          'rjscNo',
          'incorporationDate',
        ];

        individualControls.forEach((ctrl) => {
          const c = this.taxpayerForm.get(ctrl);
          if (isIndividual) c?.setValidators([Validators.required]);
          else {
            c?.clearValidators();
            c?.reset();
          }
          c?.updateValueAndValidity();
        });

        companyControls.forEach((ctrl) => {
          const c = this.taxpayerForm.get(ctrl);
          if (isCompanyOrOrg) c?.setValidators([Validators.required]);
          else {
            c?.clearValidators();
            c?.reset();
          }
          c?.updateValueAndValidity();
        });

        businessOnlyControls.forEach((ctrl) => {
          const c = this.taxpayerForm.get(ctrl);
          if (isBusiness) c?.setValidators([Validators.required]);
          else {
            c?.clearValidators();
            c?.reset();
          }
          c?.updateValueAndValidity();
        });
      });
  }

  // ───────────── API Data Loading & Dropdown Logic ─────────────

  private loadTaxpayerTypes(): void {
    this.masterData
      .getTaxpayerTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.taxpayerTypes = data),
        error: () => this.toast.error('Failed to load taxpayer types.'),
      });
  }

  private loadDivisions(): void {
    this.masterData
      .getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.divisions = data),
        error: () => this.toast.error('Failed to load divisions.'),
      });
  }

  private setupAddressDropdownLogic(): void {
    // Present Address Cascade
    this.taxpayerForm
      .get('presentAddress.division')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((divName) => {
        const selectedDiv = this.divisions.find((d) => d.name === divName);
        if (selectedDiv) {
          this.masterData
            .getDistrictsByDivision(selectedDiv.id)
            .subscribe((data) => {
              this.presentDistricts = data;
              this.taxpayerForm.get('presentAddress.district')?.setValue('');
            });
        } else {
          this.presentDistricts = [];
        }
      });

    // Permanent Address Cascade
    this.taxpayerForm
      .get('permanentAddress.division')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((divName) => {
        const selectedDiv = this.divisions.find((d) => d.name === divName);
        if (selectedDiv) {
          this.masterData
            .getDistrictsByDivision(selectedDiv.id)
            .subscribe((data) => {
              this.permanentDistricts = data;
              this.taxpayerForm.get('permanentAddress.district')?.setValue('');
            });
        } else {
          this.permanentDistricts = [];
        }
      });
  }

  // ───────────── Getters for UI  ─────────────

  get isIndividual(): boolean {
    return (
      this.taxpayerForm.get('taxpayerType')?.value?.category === 'Individual'
    );
  }

  get isBusiness(): boolean {
    return (
      this.taxpayerForm.get('taxpayerType')?.value?.category === 'Business'
    );
  }

  get isOrganization(): boolean {
    return (
      this.taxpayerForm.get('taxpayerType')?.value?.category === 'Organization'
    );
  }

  get isCompanyOrOrg(): boolean {
    const cat = this.taxpayerForm.get('taxpayerType')?.value?.category;
    return cat === 'Business' || cat === 'Organization';
  }

  // ───────────── Actions ─────────────

  onSubmit(): void {
    if (this.taxpayerForm.invalid) {
      this.taxpayerForm.markAllAsTouched();
      this.toast.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    const payload = this.taxpayerForm.getRawValue();

    this.http
      .post(API_ENDPOINTS.TAXPAYERS.CREATE, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Taxpayer created successfully!');
          setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Failed to create taxpayer.');
        },
      });
  }

  onReset(): void {
    this.taxpayerForm.reset({
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
    });
    this.toast.info('Form reset.');
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers']);
  }
}
