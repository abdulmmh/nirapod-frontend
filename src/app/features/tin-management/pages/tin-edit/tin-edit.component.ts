import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tin } from '../../../../models/tin.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';

interface Division {
  id: number;
  name: string;
}
interface District {
  id: number;
  name: string;
}
interface TaxZone {
  id: number;
  name: string;
}
interface TaxCircle {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tin-edit',
  templateUrl: './tin-edit.component.html',
  styleUrls: ['./tin-edit.component.css'],
})
export class TinEditComponent implements OnInit, OnDestroy {
  // ──────── Properties ──────────

  isLoading = true;
  isSaving = false;
  tinId: number | null = null;

  form: Partial<Tin> = {};

  // IDs tracked separately for API calls
  selectedDivisionId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedZoneId: number | null = null;

  // Dropdown Data Arrays
  divisions: Division[] = [];
  districts: District[] = [];
  taxZones: TaxZone[] = [];
  taxCircles: TaxCircle[] = [];

  // Loading states
  loadingDistricts = false;
  loadingZones = false;
  loadingCircles = false;

  private destroy$ = new Subject<void>();

  // ────────── Static Data ──────────────
  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
  statuses = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];

  // ─────────  Getter ───────────────

  get isIndividual(): boolean {
    return this.form.tinCategory === 'Individual';
  }

  get isCompany(): boolean {
    return ['Company', 'Partnership', 'NGO', 'Government'].includes(
      this.form.tinCategory ?? '',
    );
  }

  // ─────────── Constructor ──────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initializeTin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────── Initialization  ─────────────

  private initializeTin(): void {
    const id = this.getValidTinId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.tinId = id;
    this.fetchTin();
  }

  private fetchTin(): void {
    this.isLoading = true;

    this.http
      .get<Tin>(API_ENDPOINTS.TINS.GET(this.tinId!))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Tin): void {
    this.form = { ...data };

    // Formatting Dates for HTML input type="date"
    if (this.form.dateOfBirth)
      this.form.dateOfBirth = this.form.dateOfBirth.split('T')[0];
    if (this.form.incorporationDate)
      this.form.incorporationDate = this.form.incorporationDate.split('T')[0];
    if (this.form.issuedDate)
      this.form.issuedDate = this.form.issuedDate.split('T')[0];

    // Initialize dropdowns chain based on fetched data
    this.loadDivisionsForEdit();
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading TIN data:', error);
    this.toast.error('Failed to load TIN record. Please refresh or go back.');
  }

  // ─────────── Location Chain Loading (Edit Mode) ───────────

  private loadDivisionsForEdit(): void {
    this.http
      .get<Division[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (divs) => {
          this.divisions = divs;
          const matchedDiv = divs.find((d) => d.name === this.form.division);
          if (matchedDiv) {
            this.selectedDivisionId = matchedDiv.id;
            this.loadDistrictsForEdit(matchedDiv.id);
          }
        },
      });
  }

  private loadDistrictsForEdit(divId: number): void {
    this.loadingDistricts = true;
    this.http
      .get<District[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(divId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingDistricts = false)),
      )
      .subscribe({
        next: (dists) => {
          this.districts = dists;
          const matchedDist = dists.find((d) => d.name === this.form.district);
          if (matchedDist) {
            this.selectedDistrictId = matchedDist.id;
            this.loadZonesForEdit(matchedDist.id);
          }
        },
      });
  }

  private loadZonesForEdit(distId: number): void {
    this.loadingZones = true;
    this.http
      .get<TaxZone[]>(API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(distId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingZones = false)),
      )
      .subscribe({
        next: (zones) => {
          this.taxZones = zones;
          const matchedZone = zones.find((z) => z.name === this.form.taxZone);
          if (matchedZone) {
            this.selectedZoneId = matchedZone.id;
            this.loadCirclesForEdit(matchedZone.id);
          }
        },
      });
  }

  private loadCirclesForEdit(zoneId: number): void {
    this.loadingCircles = true;
    this.http
      .get<TaxCircle[]>(API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zoneId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingCircles = false)),
      )
      .subscribe({
        next: (circles) => {
          this.taxCircles = circles;
        },
      });
  }

  // ─────────── User Change Events ───────────

  onDivisionChange(): void {
    this.form.district = '';
    this.form.taxZone = '';
    this.form.taxCircle = '';
    this.districts = [];
    this.taxZones = [];
    this.taxCircles = [];
    this.selectedDistrictId = null;
    this.selectedZoneId = null;

    if (!this.selectedDivisionId) return;

    // Set division name in form
    this.form.division =
      this.divisions.find((d) => d.id === this.selectedDivisionId)?.name || '';

    this.loadingDistricts = true;
    this.http
      .get<District[]>(
        API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(
          this.selectedDivisionId,
        ),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingDistricts = false)),
      )
      .subscribe((data) => (this.districts = data));
  }

  onDistrictChange(): void {
    this.form.taxZone = '';
    this.form.taxCircle = '';
    this.taxZones = [];
    this.taxCircles = [];
    this.selectedZoneId = null;

    const district = this.districts.find((d) => d.name === this.form.district);
    if (!district) return;

    this.loadingZones = true;
    this.http
      .get<TaxZone[]>(
        API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(district.id),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingZones = false)),
      )
      .subscribe((data) => (this.taxZones = data));
  }

  onZoneChange(): void {
    this.form.taxCircle = '';
    this.taxCircles = [];

    const zone = this.taxZones.find((z) => z.name === this.form.taxZone);
    if (!zone) return;

    this.loadingCircles = true;
    this.http
      .get<TaxCircle[]>(API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zone.id))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingCircles = false)),
      )
      .subscribe((data) => (this.taxCircles = data));
  }

  // ─────────── Validation  ────────────────

  private getValidTinId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);
    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid TIN ID. Please go back and try again.');
  }

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName &&
      this.form.tinCategory &&
      this.form.phone &&
      this.form.taxZone &&
      this.form.taxCircle &&
      this.form.issuedDate &&
      (this.isIndividual ? this.form.nid : true) &&
      this.form.division &&
      this.form.district &&
      this.form.status
    );
  }

  // ───────── Actions  ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning(
        'Please fill in all required fields with valid values.',
      );
      return;
    }

    this.isSaving = true;
    this.http
      .put(API_ENDPOINTS.TINS.UPDATE(this.tinId!), this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('TIN record updated successfully!');
          this.router.navigate(['/tin/view', this.tinId]);
        },
        error: () => {
          this.toast.error('Failed to update TIN record. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/tin/view', this.tinId]);
  }
}
