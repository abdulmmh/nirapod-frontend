import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { TaxpayerType } from 'src/app/models/master-data.model';

@Component({
  selector: 'app-taxpayer-edit',
  templateUrl: './taxpayer-edit.component.html',
  styleUrls: ['./taxpayer-edit.component.css'],
})
export class TaxpayerEditComponent implements OnInit, OnDestroy {
  // ─────────────────── Properties ───────────────────
  taxpayerForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  taxpayerId: number | null = null;

  taxpayerTypes: TaxpayerType[] = [];
  divisions: any[] = [];
  presentDistricts: any[] = [];
  permanentDistricts: any[] = [];

  private destroy$ = new Subject<void>();

  statuses = ['Active', 'Inactive', 'Pending', 'Suspended'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private toast: ToastService,
    private masterData: MasterDataService,
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initForm();
    this.setupConditionalLogic();
    this.setupAddressDropdownLogic();
    this.loadMasterData();
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
      id: [null],
      tinNumber: [''], // Just to keep the value for the banner
      taxpayerType: [null, Validators.required],
      registrationDate: ['', Validators.required],

      // Individual Fields
      fullName: [''],
      nid: [''],
      fathersName: [''],
      mothersName: [''],
      dateOfBirth: [''],
      profession: [''],

      // Company Fields
      companyName: [''],
      companySubType: [''],
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

  private setupConditionalLogic(): void {
    this.taxpayerForm
      .get('sameAsPermanent')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((isSame) => {
        const pGroup = this.taxpayerForm.get('permanentAddress');
        if (isSame) {
          pGroup?.disable();
          pGroup?.patchValue(this.taxpayerForm.get('presentAddress')?.value);
        } else {
          pGroup?.enable();
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

    // Individual vs Company Logic (Updated with includes)
    this.taxpayerForm.get('taxpayerType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: TaxpayerType) => {

        const category = type?.category;

        const isIndividual = category === 'INDIVIDUAL';
        const isCompany = category === 'COMPANY';

        const individualControls = ['fullName', 'nid', 'fathersName', 'mothersName', 'dateOfBirth', 'profession'];
        const companyControls = [
          'companyName', 'companySubType', 'incorporationDate',
          'tradeLicenseNo', 'rjscNo', 'natureOfBusiness',
          'authorizedPersonName', 'authorizedPersonNid', 'authorizedPersonDesignation'
        ];

        individualControls.forEach(ctrl => {
          const control = this.taxpayerForm.get(ctrl);
          if (isIndividual) control?.setValidators([Validators.required]);
          else { control?.clearValidators(); control?.reset(); }
          control?.updateValueAndValidity();
        });

        companyControls.forEach(ctrl => {
          const control = this.taxpayerForm.get(ctrl);
          if (isCompany) control?.setValidators([Validators.required]);
          else { control?.clearValidators(); control?.reset(); }
          control?.updateValueAndValidity();
        });
      });
  }

  private setupAddressDropdownLogic(): void {
    this.taxpayerForm
      .get('presentAddress.division')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((divName) => {
        const div = this.divisions.find((d) => d.name === divName);
        if (div) {
          this.masterData
            .getDistrictsByDivision(div.id)
            .subscribe((data) => (this.presentDistricts = data));
        }
      });

    this.taxpayerForm
      .get('permanentAddress.division')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((divName) => {
        const div = this.divisions.find((d) => d.name === divName);
        if (div) {
          this.masterData
            .getDistrictsByDivision(div.id)
            .subscribe((data) => (this.permanentDistricts = data));
        }
      });
  }

  // ───────────── Data Loading ─────────────

  private loadMasterData(): void {
    this.masterData
      .getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.divisions = data));
    this.masterData
      .getTaxpayerTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.taxpayerTypes = data;
          this.initializeTaxpayer();
        },
        error: () => this.toast.error('Failed to load taxpayer types.'),
      });
  }

  private initializeTaxpayer(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.taxpayerId = Number(rawId);

    if (!this.taxpayerId || isNaN(this.taxpayerId)) {
      this.toast.error('Invalid taxpayer ID.');
      this.isLoading = false;
      return;
    }

    this.http
      .get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: () => this.toast.error('Failed to fetch taxpayer details.'),
      });
  }

  private handleFetchSuccess(data: Taxpayer): void {
    const matchedType = this.taxpayerTypes.find(
      (t) => t.id === data.taxpayerType?.id,
    );

    // Format dates for input type="date"
    const formattedData = {
      ...data,
      taxpayerType: matchedType,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
      incorporationDate: data.incorporationDate
        ? data.incorporationDate.split('T')[0]
        : '',
      registrationDate: data.registrationDate
        ? data.registrationDate.split('T')[0]
        : '',
    };

    this.taxpayerForm.patchValue(formattedData);

    if (data.presentAddress?.division) {
      const div = this.divisions.find(
        (d) => d.name === data.presentAddress.division,
      );
      if (div) {
        this.masterData.getDistrictsByDivision(div.id).subscribe((dists) => {
          this.presentDistricts = dists;
          this.taxpayerForm
            .get('presentAddress.district')
            ?.setValue(data.presentAddress.district);
        });
      }
    }
    if (data.permanentAddress?.division && !data.sameAsPermanent) {
      const div = this.divisions.find(
        (d) => d.name === data.permanentAddress.division,
      );
      if (div) {
        this.masterData.getDistrictsByDivision(div.id).subscribe((dists) => {
          this.permanentDistricts = dists;
          this.taxpayerForm
            .get('permanentAddress.district')
            ?.setValue(data.permanentAddress.district);
        });
      }
    }
  }

  // ───────────── Getters (Updated with includes) ─────────────

  get isIndividual(): boolean {
    return this.taxpayerForm.get('taxpayerType')?.value?.category === 'INDIVIDUAL';
  }

  get isCompany(): boolean {
    return this.taxpayerForm.get('taxpayerType')?.value?.category === 'COMPANY';
  }

  // ─────────── Actions ──────────────

  onSubmit(): void {
    if (this.taxpayerForm.invalid) {
      this.taxpayerForm.markAllAsTouched();
      this.toast.warning('Please check the required fields.');
      return;
    }

    this.isSaving = true;
    this.http
      .put(
        API_ENDPOINTS.TAXPAYERS.UPDATE(this.taxpayerId!),
        this.taxpayerForm.getRawValue(),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Taxpayer updated successfully!');
          this.router.navigate(['/taxpayers', 'view', this.taxpayerId]);
        },
        error: () => this.toast.error('Failed to update taxpayer.'),
      });
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers', 'view', this.taxpayerId]);
  }
}
