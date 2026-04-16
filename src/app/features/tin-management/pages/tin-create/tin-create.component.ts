import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TinCreateRequest } from '../../../../models/tin.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { District, Division, TaxCircle, TaxZone } from 'src/app/models/master-data.model';

@Component({
  selector: 'app-tin-create',
  templateUrl: './tin-create.component.html',
  styleUrls: ['./tin-create.component.css'],
})
export class TinCreateComponent implements OnDestroy {

  // ── Form State ──
  isLoading = false;
  form: TinCreateRequest = this.getEmptyForm();

  selectedDivisionId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedZoneId: number | null = null;

  // ── Taxpayer Search ──
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;
  hasSearched = false;

  // ── Dropdown Data ──
  divisions: Division[] = [];
  districts: District[] = [];
  taxZones: TaxZone[] = [];
  taxCircles: TaxCircle[] = [];

  loadingDistricts = false;
  loadingZones = false;
  loadingCircles = false;

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {
    this.loadDivisions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Getters ──

  get isIndividual(): boolean {
    return this.form.tinCategory === 'Individual';
  }

  get isCompany(): boolean {
    return ['Company', 'Partnership', 'NGO', 'Government'].includes(this.form.tinCategory);
  }

  get isAutoFilled(): boolean {
    return this.selectedTaxpayer !== null;
  }

  // ── Helper ──

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const typeName = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return typeName.includes('company') ? (tp.companyName || 'Unknown Company') : (tp.fullName || 'Unknown Individual');
  }

  // ── Loaders ──

  private loadDivisions(): void {
    this.http.get<Division[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.divisions = data),
        error: () => this.toast.error('Could not load divisions.'),
      });
  }

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

    this.loadingDistricts = true;
    this.http.get<District[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(this.selectedDivisionId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingDistricts = false)))
      .subscribe({
        next: (data) => (this.districts = data),
        error: () => this.toast.error('Could not load districts.'),
      });
  }

  onDistrictChange(): void {
    this.form.taxZone = '';
    this.form.taxCircle = '';
    this.taxZones = [];
    this.taxCircles = [];
    this.selectedZoneId = null;

    const district = this.districts.find((d) => d.name === this.form.district);
    if (!district) return;

    this.selectedDistrictId = district.id;
    this.form.division = this.divisions.find((d) => d.id === this.selectedDivisionId)?.name || '';

    this.loadingZones = true;
    this.http.get<TaxZone[]>(API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(district.id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingZones = false)))
      .subscribe({
        next: (data) => {
          this.taxZones = data;
          if (data.length === 0) this.toast.info('No tax zones found for this district.');
        },
        error: () => this.toast.error('Could not load tax zones.'),
      });
  }

  onZoneChange(): void {
    this.form.taxCircle = '';
    this.taxCircles = [];

    const zone = this.taxZones.find((z) => z.zoneName === this.form.taxZone);
    if (!zone) return;

    this.selectedZoneId = zone.id;

    this.loadingCircles = true;
    this.http.get<TaxCircle[]>(API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zone.id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingCircles = false)))
      .subscribe({
        next: (data) => (this.taxCircles = data),
        error: () => this.toast.error('Could not load tax circles.'),
      });
  }

  // ── Taxpayer Search ──

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      this.hasSearched = false;
    }
  }

  // Problem 5 fix: enforces minimum 3 characters, delegates filtering entirely to the backend.
  // The ?search= param is now handled server-side in TaxpayerController.
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();

    if (!q) {
      this.toast.warning('Enter NID number, name, or TIN to search.');
      return;
    }

    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        // Problem 5 fix: no client-side .filter() — backend returns only matching results
        next: (data) => {
          this.searchResults = data;
          this.showResults = true;
          this.hasSearched = true;
          if (data.length === 0) {
            this.toast.info('No taxpayer found. Check the NID, name, or TIN and try again.');
          }
        },
        error: () => this.toast.error('Search failed. Please try again.'),
      });
  }

  selectTaxpayer(taxpayer: Taxpayer): void {

    // Problem 4 fix — frontend guard: block selection if TIN already issued
    if (taxpayer.tinNumber) {
      this.toast.error(
        `This taxpayer already has TIN: ${taxpayer.tinNumber}. A second TIN cannot be issued.`
      );
      this.showResults = false;
      return;
    }

    this.selectedTaxpayer = taxpayer;
    this.showResults = false;

    const typeName = taxpayer.taxpayerType?.typeName?.toLowerCase() || '';
    const isComp = typeName.includes('company');

    // Auto-fill form fields from taxpayer record
    this.form.tinCategory = isComp ? 'Company' : 'Individual';
    this.form.taxpayerName = this.getDisplayName(taxpayer);
    this.form.email = taxpayer.email || '';
    this.form.phone = taxpayer.phone || '';

    if (isComp) {
      this.form.incorporationDate = taxpayer.incorporationDate
        ? taxpayer.incorporationDate.toString().split('T')[0]
        : '';
      this.form.nid = taxpayer.authorizedPersonNid || '';
    } else {
      this.form.dateOfBirth = taxpayer.dateOfBirth
        ? taxpayer.dateOfBirth.toString().split('T')[0]
        : '';
      this.form.nid = taxpayer.nid || '';
    }

    // Address cascade auto-fill from taxpayer's present address
    if (taxpayer.presentAddress) {
      const addr = taxpayer.presentAddress;

      let addrStr = '';
      if (addr.houseNo) addrStr += addr.houseNo + ', ';
      if (addr.roadVillage) addrStr += addr.roadVillage + ', ';
      if (addr.thana) addrStr += addr.thana;
      this.form.address = addrStr;

      if (addr.division && this.divisions.length > 0) {
        const matchedDiv = this.divisions.find(
          (d) => d.name.toLowerCase() === addr.division.toLowerCase(),
        );
        if (matchedDiv) {
          this.selectedDivisionId = matchedDiv.id;
          this.loadingDistricts = true;

          this.http.get<District[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(matchedDiv.id))
            .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingDistricts = false)))
            .subscribe({
              next: (districtsData) => {
                this.districts = districtsData;
                const matchedDist = districtsData.find(
                  (d) => d.name.toLowerCase() === addr.district.toLowerCase(),
                );
                if (matchedDist) {
                  this.form.district = matchedDist.name;
                  this.onDistrictChange();
                }
              },
            });
        }
      }
    }

    this.toast.success(`"${this.form.taxpayerName}" auto-filled. Select Tax Zone and Circle to continue.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
    this.hasSearched = false;
    this.form = this.getEmptyForm();
    this.selectedDivisionId = null;
    this.districts = [];
    this.taxZones = [];
    this.taxCircles = [];
    this.toast.info('Taxpayer cleared.');
  }

  // ── Validation ──

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName &&
      this.form.tinCategory &&
      this.form.phone &&
      this.form.taxZone &&
      this.form.taxCircle &&
      this.form.issuedDate &&
      this.form.division &&
      this.form.district &&
      (this.isIndividual ? this.form.nid || this.form.passportNo : true)
    );
  }

  // ── Submit ──

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill all required fields.');
      return;
    }
    this.isLoading = true;

    const payload = {
      ...this.form,
      taxpayerId: this.selectedTaxpayer?.id,
    };

    this.http.post(API_ENDPOINTS.TINS.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('TIN issued successfully!');
          setTimeout(() => this.router.navigate(['/tin']), 1500);
        },

        error: (err) => {
          if (err.status === 409) {
            this.toast.error(err.error?.message || 'This taxpayer already has a TIN.');
          } else {
            this.toast.error('Failed to issue TIN. Please try again.');
          }
          console.error(err);
        },
      });
  }

  onReset(): void {
    this.clearSelectedTaxpayer();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/tin']);
  }

  private getEmptyForm(): TinCreateRequest {
    return {
      taxpayerName: '',
      tinCategory: '',
      nid: '',
      passportNo: '',
      dateOfBirth: '',
      incorporationDate: '',
      email: '',
      phone: '',
      address: '',
      district: '',
      division: '',
      taxZone: '',
      taxCircle: '',
      issuedDate: new Date().toISOString().split('T')[0],
      remarks: '',
    };
  }
}