import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import {
  Division,
  District,
  BusinessType,
  BusinessCategory,
} from '../../../../models/master-data.model';

@Component({
  selector: 'app-vat-registration-edit',
  templateUrl: './vat-registration-edit.component.html',
  styleUrls: ['./vat-registration-edit.component.css'],
})
export class VatRegistrationEditComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading = true;
  isSaving  = false;
  vatId     = 0;
  binNo     = '';
  businessName = '';

  private destroy$ = new Subject<void>();

  // ── Static dropdowns ─────────────────────────────────────────────────────
  readonly vatCategories = ['Standard', 'Zero Rated', 'Exempt', 'Special'];
  readonly statuses      = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];

  // ── Dynamic dropdowns ─────────────────────────────────────────────────────
  divisions:          Division[]         = [];
  districts:          District[]         = [];
  businessTypes:      BusinessType[]     = [];
  businessCategories: BusinessCategory[] = [];
  vatZones:           any[]              = [];
  vatCircles:         any[]              = [];

  // Loading flags
  loadingDistricts = false;
  loadingCircles   = false;

  // ── Cascade-restore pending value ─────────────────────────────────────────
  /**
   * Set immediately before patching divisionId so the reactive district
   * subscriber can auto-select the correct district once its list loads.
   * Mirrors the pattern used in VatRegistrationCreateComponent.
   */
  private pendingDistrictId: number | null = null;

  constructor(
    private fb:         FormBuilder,
    private route:      ActivatedRoute,
    private router:     Router,
    private http:       HttpClient,
    private toast:      ToastService,
    private masterData: MasterDataService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadStaticDropdowns();
    this.setupCascadeListeners(); // must run before loadData() so the subscriber is ready
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      tinNumber:          ['', Validators.required],
      businessName:       ['', Validators.required],
      ownerName:          [''],
      vatCategory:        ['', Validators.required],
      businessTypeId:     [null],
      businessCategoryId: [null],
      tradeLicenseNo:     [''],
      status:             ['Active'],
      // Location — division/district are location-only in edit;
      // zone is independent of district (see cascade architecture below).
      divisionId:         [null],
      districtId:         [null],
      vatZoneId:          [null, Validators.required],
      vatCircleId:        [null, Validators.required],
      registrationDate:   [''],
      effectiveDate:      [''],
      expiryDate:         [''],
      annualTurnover:     [0],
      email:              ['', Validators.email],
      phone:              ['', Validators.required],
      address:            [''],
      remarks:            [''],
    });
  }

  ctrl(name: string) {
    return this.form.get(name);
  }

  // ── Static dropdown loading ────────────────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.divisions = data));

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.businessTypes = data));

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.businessCategories = data));
  }

  // ── Cascade: Division → District (reactive) ────────────────────────────────
  /**
   * Replaces the old onDivisionChange() imperative handler.
   *
   * Architecture decision for edit:
   *   Division → District   REACTIVE — handled here via valueChanges + switchMap.
   *   Zone     → Circles    MANUAL   — kept in onZoneChange() because in edit mode
   *                                    zone assignment is independent of district.
   *                                    The officer may change circle without re-selecting
   *                                    the full Division → District → Zone chain.
   *
   * This is intentionally different from the create component, where the zone
   * is always derived from the business address and the full chain fires once.
   */
  private setupCascadeListeners(): void {
    this.form.get('divisionId')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        // Clear district when division changes; zones/circles are NOT reset here
        // because zone is independent of district in edit mode.
        this.districts = [];
        this.form.patchValue({ districtId: null }, { emitEvent: false });
      }),
      filter(id => !!id),
      switchMap(id => {
        this.loadingDistricts = true;
        return this.masterData.getDistrictsByDivision(id).pipe(
          catchError(() => of([])),
          finalize(() => (this.loadingDistricts = false)),
        );
      }),
    ).subscribe(districts => {
      this.districts = districts;
      // Apply pending districtId from loadData() restore.
      if (this.pendingDistrictId !== null) {
        this.form.patchValue({ districtId: this.pendingDistrictId });
        this.pendingDistrictId = null;
      }
    });
  }

  // ── Load existing record ───────────────────────────────────────────────────
  /**
   * Loads the VAT registration and restores the form, including dropdowns.
   *
   * Cascade restore strategy:
   *
   * Zone/Circle:
   *   `zoneId` is a regular DB column (not @Transient) so it is always present
   *   in the GET response. We use it to load circles directly — no district
   *   gate is required. vatCircleId is @Transient and will be null in most
   *   GET responses; the circle dropdown defaults to unselected in that case.
   *
   * Division/District:
   *   Both are @Transient on the Java entity and typically null in GET responses.
   *   If the backend is updated to populate them, this code handles them via
   *   the pendingDistrictId pattern. Otherwise the location dropdowns start
   *   unselected, which is safe — the string values (district, division) are
   *   still displayed elsewhere in the UI.
   */
  private loadData(): void {
    this.isLoading = true;
    this.http
      .get<VatRegistration>(API_ENDPOINTS.VAT_REGISTRATIONS.GET(this.vatId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.binNo        = data.binNo;
          this.businessName = data.businessName;

          // ── Patch non-cascade fields ──────────────────────────────────────
          this.form.patchValue({
            tinNumber:          data.tinNumber,
            businessName:       data.businessName,
            ownerName:          data.ownerName,
            vatCategory:        data.vatCategory,
            businessTypeId:     (data as any)['businessTypeId']    ?? null,
            businessCategoryId: (data as any)['businessCategoryId'] ?? null,
            tradeLicenseNo:     data.tradeLicenseNo,
            status:             data.status,
            registrationDate:   data.registrationDate,
            effectiveDate:      data.effectiveDate,
            expiryDate:         data.expiryDate,
            annualTurnover:     data.annualTurnover,
            email:              data.email,
            phone:              data.phone,
            address:            data.address,
            remarks:            data.remarks,
          });

          // ── Restore Zone → Circles (direct, no district gate) ────────────
          // zoneId is a persisted DB column — always present in the response.
          const zoneId   = (data as any)['zoneId']     ?? null;
          const circleId = (data as any)['vatCircleId'] ?? null; // @Transient, usually null

          if (zoneId) {
            // Patch vatZoneId silently first so the select shows the current zone.
            this.form.patchValue({ vatZoneId: zoneId }, { emitEvent: false });

            // Load circles for this zone directly — no division/district required.
            this.loadingCircles = true;
            this.masterData.getTaxCirclesByZone(zoneId)
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingCircles = false)),
              )
              .subscribe(circles => {
                this.vatCircles = circles;
                if (circleId) {
                  this.form.patchValue({ vatCircleId: circleId });
                }
              });
          }

          // ── Restore Division → District (pendingId pattern) ───────────────
          // Both IDs are @Transient; they will be null unless the backend
          // is extended to populate them in the GET response.
          const divisionId = (data as any)['divisionId'] ?? null;
          const districtId = (data as any)['districtId'] ?? null;

          if (divisionId) {
            // Arm the pending district before emitting divisionId,
            // so the reactive subscriber in setupCascadeListeners() can
            // auto-select it once the district list loads.
            this.pendingDistrictId = districtId;
            this.form.patchValue({ divisionId }); // triggers switchMap
          }
        },
        error: () => {
          this.toast.error('Failed to load VAT registration data.');
          this.router.navigate(['/vat-registration']);
        },
      });
  }

  // ── Zone → Circles (manual — zone is independent of district in edit) ──────
  /**
   * Fires when the officer manually changes the VAT Zone dropdown.
   * Zone selection is not gated on district in edit mode because:
   *   1. Officers know which zone they are assigning.
   *   2. The stored zoneId lets us restore zone without going through
   *      the division → district chain.
   */
  onZoneChange(): void {
    const zoneId = this.ctrl('vatZoneId')?.value;
    this.vatCircles = [];
    this.form.patchValue({ vatCircleId: null });

    if (!zoneId) return;

    this.loadingCircles = true;
    this.masterData.getTaxCirclesByZone(zoneId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingCircles = false)))
      .subscribe(circles => (this.vatCircles = circles));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    this.http
      .put(API_ENDPOINTS.VAT_REGISTRATIONS.UPDATE(this.vatId), this.form.value)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Registration updated successfully!');
          setTimeout(
            () => this.router.navigate(['/vat-registration/view', this.vatId]),
            1500,
          );
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'Conflict: duplicate registration detected.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to update VAT registration. Please try again.');
          }
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/vat-registration/view', this.vatId]);
  }
}