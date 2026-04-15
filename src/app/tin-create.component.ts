// import { Component, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
// import { TinCreateRequest } from '../../../../models/tin.model';
// import { Taxpayer } from '../../../../models/taxpayer.model';
// import { finalize, Subject, takeUntil } from 'rxjs';
// import { ToastService } from 'src/app/shared/toast/toast.service';
// import { DistrictObj, DivisionObj } from 'src/app/models/business.model';
// import { MasterDataService } from 'src/app/core/services/master-data.service';

// @Component({
//   selector: 'app-tin-create',
//   templateUrl: './tin-create.component.html',
//   styleUrls: ['./tin-create.component.css'],
// })
// export class TinCreateComponent implements OnDestroy {

//   // ── Form State ──
//   isLoading = false;
//   form: TinCreateRequest = this.getEmptyForm();

//   // ── Taxpayer Search ──
//   searchQuery       = '';
//   isSearching       = false;
//   searchResults:    Taxpayer[] = [];
//   selectedTaxpayer: Taxpayer | null = null;
//   showResults       = false;
//   hasSearched       = false;

//   // Dropdown data
//   divisions:          DivisionObj[] = [];
//   districts:          DistrictObj[] = [];

//   private destroy$ = new Subject<void>();

//   // ── Static Data ──
//   tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
//   // divisions     = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh'];
//   taxZones      = ['Zone-1','Zone-2','Zone-3','Zone-4','Zone-5','Zone-6'];
//   taxCircles    = ['Circle-1','Circle-2','Circle-3','Circle-4','Circle-5','Circle-6','Circle-7','Circle-8'];

//   // districts: Record<string, string[]> = {
//   //   Dhaka:      ['Dhaka','Gazipur','Narayanganj','Tangail','Narsingdi'],
//   //   Chittagong: ['Chittagong',"Cox's Bazar",'Comilla','Feni','Brahmanbaria'],
//   //   Rajshahi:   ['Rajshahi','Bogra','Pabna','Sirajganj','Natore'],
//   //   Khulna:     ['Khulna','Jessore','Satkhira','Bagerhat','Kushtia'],
//   //   Barisal:    ['Barisal','Bhola','Patuakhali','Jhalokati','Pirojpur'],
//   //   Sylhet:     ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
//   //   Rangpur:    ['Rangpur','Dinajpur','Kurigram','Gaibandha','Lalmonirhat'],
//   //   Mymensingh: ['Mymensingh','Netrokona','Jamalpur','Sherpur'],
//   // };

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private toast: ToastService,
//     private masterData : MasterDataService
//   ) {}

//   ngOnInit(): void { this.loadInitialData(); }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ──────────────── Load Master Data ────────────────

//   loadInitialData(): void {
//     this.masterData.getDivisions()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: data => this.divisions = data,
//         error: () => this.toast.error('Failed to load divisions.')
//     });
//   }  


//   // ── Getters ──
//   get isIndividual(): boolean {
//     return this.form.tinCategory === 'Individual';
//   }

//   get isCompany(): boolean {
//     return ['Company','Partnership','NGO','Government'].includes(this.form.tinCategory);
//   }

//   get isAutoFilled(): boolean {
//     return this.selectedTaxpayer !== null;
//   }

//   // ── Search ──
//   onSearchInput(): void {
//     if (!this.searchQuery.trim()) {
//       this.searchResults = [];
//       this.showResults   = false;
//       this.hasSearched   = false;
//     }
//   }

//   searchTaxpayer(): void {
//     const q = this.searchQuery.trim();
//     if (!q) {
//       this.toast.warning('Enter NID or name to search');
//       return;
//     }

//     this.isSearching = true;
//     this.showResults = false;
//     this.hasSearched = false;

//     const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
//     this.http.get<Taxpayer[]>(url)
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => (this.isSearching = false))
//       )
//       .subscribe({
//         next:  (data) => this.handleSearchSuccess(data, q),
//         error: ()     => this.handleSearchError(),
//       });
//   }

//   private handleSearchSuccess(data: Taxpayer[], query: string): void {
//     const q = query.toLowerCase();

//     this.searchResults = data.filter(t =>
//       t.nid?.toLowerCase().includes(q) ||
//       t.fullName?.toLowerCase().includes(q)
//     );

//     this.showResults = true;
//     this.hasSearched = true;

//     if (this.searchResults.length === 0) {
//       this.toast.info('No match found — enter details manually below');
//     }
//   }

//   private handleSearchError(): void {
//     this.toast.error('Couldn’t search right now — please try again');
//   }

//   selectTaxpayer(taxpayer: Taxpayer): void {
//     this.selectedTaxpayer = taxpayer;
//     this.showResults      = false;
//     this.searchQuery      = taxpayer.fullName;

//     this.form.taxpayerName = taxpayer.fullName  || '';
//     this.form.nid          = taxpayer.nid       || '';
//     this.form.email        = taxpayer.email     || '';
//     this.form.phone        = taxpayer.phone     || '';
//     this.form.address      = taxpayer.address   || '';
//     this.form.dateOfBirth  = taxpayer.dateOfBirth
//       ? (taxpayer.dateOfBirth as string).split('T')[0]
//       : '';

//     this.toast.success(`Details loaded for "${taxpayer.fullName}"`);
//   }

//   clearSelectedTaxpayer(): void {
//     this.selectedTaxpayer = null;
//     this.searchQuery      = '';
//     this.searchResults    = [];
//     this.showResults      = false;
//     this.hasSearched      = false;
//     this.form             = this.getEmptyForm();

//     this.toast.info('Selection cleared');
//   }

//   // ── Events ──
//   onDivisionChange(): void {
//     this.form.district = '';
//   }

//   // ── Validation ──
//   isFormValid(): boolean {
//     return !!(
//       this.form.taxpayerName &&
//       this.form.tinCategory &&
//       this.form.phone &&
//       this.form.taxZone &&
//       this.form.taxCircle &&
//       this.form.issuedDate &&
//       this.form.division &&
//       this.form.district &&
//       (this.isIndividual ? this.form.nid || this.form.passportNo : true)
//     );
//   }

//   // ── Submit ──
//   onSubmit(): void {
//     if (!this.isFormValid()) {
//       this.toast.warning('Please fill in all required fields');
//       return;
//     }

//     this.isLoading = true;

//     this.http.post(API_ENDPOINTS.TINS.CREATE, this.form)
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => (this.isLoading = false))
//       )
//       .subscribe({
//         next: () => this.handleSuccess(),
//         error: (e) => this.handleError(e),
//       });
//   }

//   private handleSuccess(): void {
//     this.toast.success('TIN issued successfully');
//     setTimeout(() => this.router.navigate(['/tin']), 1500);
//   }

//   private handleError(error: unknown): void {
//     console.error('TIN create error:', error);
//     this.toast.error('Something went wrong — please try again');
//   }

//   // ── Reset ──
//   onReset(): void {
//     this.form = this.getEmptyForm();
//     this.selectedTaxpayer = null;
//     this.searchQuery = '';
//     this.searchResults = [];
//     this.showResults = false;
//     this.hasSearched = false;

//     this.toast.info('Form reset');
//   }

//   // ── Cancel ──
//   onCancel(): void {
//     this.router.navigate(['/tin']);
//   }

//   // ── Default Form ──
//   private getEmptyForm(): TinCreateRequest {
//     return {
//       taxpayerName: '',
//       tinCategory: '',
//       nid: '',
//       passportNo: '',
//       dateOfBirth: '',
//       incorporationDate: '',
//       email: '',
//       phone: '',
//       address: '',
//       district: '',
//       division: '',
//       taxZone: '',
//       taxCircle: '',
//       issuedDate: new Date().toISOString().split('T')[0],
//       remarks: '',
//     };
//   }
// }