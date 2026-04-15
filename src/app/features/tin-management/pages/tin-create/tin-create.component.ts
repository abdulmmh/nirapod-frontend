import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TinCreateRequest } from '../../../../models/tin.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

interface Division  { id: number; name: string; }
interface District  { id: number; name: string; }
interface TaxZone   { id: number; name: string; }
interface TaxCircle { id: number; name: string; }

@Component({
  selector: 'app-tin-create',
  templateUrl: './tin-create.component.html',
  styleUrls: ['./tin-create.component.css'],
})
export class TinCreateComponent implements OnDestroy {

  // ── Form State ──
  isLoading = false;
  form: TinCreateRequest = this.getEmptyForm();

  // IDs tracked separately for API calls
  selectedDivisionId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedZoneId:     number | null = null;

  // ── Taxpayer Search ──
  searchQuery       = '';
  isSearching       = false;
  searchResults:    Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults       = false;
  hasSearched       = false;

  // ── Dropdown Data ──
  divisions:   Division[]  = [];
  districts:   District[]  = [];
  taxZones:    TaxZone[]   = [];
  taxCircles:  TaxCircle[] = [];

  // Loading states for each dropdown
  loadingDistricts   = false;
  loadingZones       = false;
  loadingCircles     = false;

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {
    this.loadDivisions();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Getters ──
  get isIndividual(): boolean { return this.form.tinCategory === 'Individual'; }
  get isCompany(): boolean    { return ['Company','Partnership','NGO','Government'].includes(this.form.tinCategory); }
  get isAutoFilled(): boolean { return this.selectedTaxpayer !== null; }

  // ── Load Divisions on init ──
  private loadDivisions(): void {
    this.http.get<Division[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (data) => (this.divisions = data),
        error: ()     => this.toast.error('Could not load divisions.'),
      });
  }

  // ── Division change → load districts ──
  onDivisionChange(): void {
    this.form.district  = '';
    this.form.taxZone   = '';
    this.form.taxCircle = '';
    this.districts      = [];
    this.taxZones       = [];
    this.taxCircles     = [];
    this.selectedDistrictId = null;
    this.selectedZoneId     = null;

    if (!this.selectedDivisionId) return;

    this.loadingDistricts = true;
    this.http
      .get<District[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(this.selectedDivisionId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingDistricts = false)))
      .subscribe({
        next:  (data) => (this.districts = data),
        error: ()     => this.toast.error('Could not load districts.'),
      });
  }

  // ── District change → load tax zones ──
  onDistrictChange(): void {
    this.form.taxZone   = '';
    this.form.taxCircle = '';
    this.taxZones       = [];
    this.taxCircles     = [];
    this.selectedZoneId = null;

    const district = this.districts.find(d => d.name === this.form.district);
    if (!district) return;

    this.selectedDistrictId = district.id;
    this.form.division = this.divisions.find(d => d.id === this.selectedDivisionId)?.name || '';

    this.loadingZones = true;
    this.http
      .get<TaxZone[]>(API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(district.id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingZones = false)))
      .subscribe({
        next:  (data) => {
          this.taxZones = data;
          if (data.length === 0) this.toast.info('No tax zones found for this district.');
        },
        error: () => this.toast.error('Could not load tax zones.'),
      });
  }

  // ── Zone change → load tax circles ──
  onZoneChange(): void {
    this.form.taxCircle = '';
    this.taxCircles     = [];

    const zone = this.taxZones.find(z => z.name === this.form.taxZone);
    if (!zone) return;

    this.selectedZoneId = zone.id;

    this.loadingCircles = true;
    this.http
      .get<TaxCircle[]>(API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zone.id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingCircles = false)))
      .subscribe({
        next:  (data) => (this.taxCircles = data),
        error: ()     => this.toast.error('Could not load tax circles.'),
      });
  }

  // ── Taxpayer Search ──
  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) { this.toast.warning('Enter NID number or taxpayer name.'); return; }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next:  (data) => this.handleSearchSuccess(data, q),
        error: ()     => this.toast.error('Search failed. Please try again.'),
      });
  }

  private handleSearchSuccess(data: Taxpayer[], query: string): void {
    const q = query.toLowerCase();
    this.searchResults = data.filter(t =>
      t.nid?.toLowerCase().includes(q) || t.fullName?.toLowerCase().includes(q)
    );
    this.showResults = true;
    this.hasSearched = true;
    if (this.searchResults.length === 0) {
      this.toast.info('No taxpayer found. Fill in the details manually.');
    }
  }

  selectTaxpayer(taxpayer: Taxpayer): void {
    this.selectedTaxpayer = taxpayer;
    this.showResults      = false;
    this.searchQuery      = taxpayer.fullName;

    this.form.taxpayerName = taxpayer.fullName  || '';
    this.form.nid          = taxpayer.nid       || '';
    this.form.email        = taxpayer.email     || '';
    this.form.phone        = taxpayer.phone     || '';
    this.form.address      = taxpayer.address   || '';
    this.form.dateOfBirth  = taxpayer.dateOfBirth
      ? (taxpayer.dateOfBirth as string).split('T')[0] : '';

    this.toast.success(`"${taxpayer.fullName}" details auto-filled.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;
    this.form             = this.getEmptyForm();
    this.toast.info('Taxpayer cleared.');
  }

  // ── Validation ──
  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName && this.form.tinCategory &&
      this.form.phone        && this.form.taxZone     &&
      this.form.taxCircle    && this.form.issuedDate  &&
      this.form.division     && this.form.district    &&
      (this.isIndividual ? this.form.nid || this.form.passportNo : true)
    );
  }

  // ── Submit ──
  onSubmit(): void {
    if (!this.isFormValid()) { this.toast.warning('Please fill all required fields.'); return; }
    this.isLoading = true;
    this.http.post(API_ENDPOINTS.TINS.CREATE, this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next:  () => { this.toast.success('TIN issued successfully!'); setTimeout(() => this.router.navigate(['/tin']), 1500); },
        error: (e) => { console.error(e); this.toast.error('Failed to issue TIN. Please try again.'); },
      });
  }

  onReset(): void {
    this.form               = this.getEmptyForm();
    this.selectedTaxpayer   = null;
    this.selectedDivisionId = null;
    this.selectedDistrictId = null;
    this.selectedZoneId     = null;
    this.searchQuery        = '';
    this.searchResults      = [];
    this.showResults        = false;
    this.hasSearched        = false;
    this.districts          = [];
    this.taxZones           = [];
    this.taxCircles         = [];
    this.toast.info('Form has been reset.');
  }

  onCancel(): void { this.router.navigate(['/tin']); }

  private getEmptyForm(): TinCreateRequest {
    return {
      taxpayerName: '', tinCategory: '', nid: '', passportNo: '',
      dateOfBirth: '', incorporationDate: '', email: '', phone: '',
      address: '', district: '', division: '', taxZone: '', taxCircle: '',
      issuedDate: new Date().toISOString().split('T')[0], remarks: '',
    };
  }
}