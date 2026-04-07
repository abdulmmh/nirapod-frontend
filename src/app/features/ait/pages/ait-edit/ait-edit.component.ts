import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Ait } from 'src/app/models/ait.model';

@Component({
  selector: 'app-ait-edit',
  templateUrl: './ait-edit.component.html',
  styleUrls: ['./ait-edit.component.css']
})
export class AitEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  aitId : number | null = null;

  statuses    = ['Draft', 'Deducted', 'Deposited', 'Credited', 'Disputed'];
  fiscalYears = ['2024-25', '2023-24', '2022-23'];
  sourceTypes = ['Salary', 'Import', 'Contract', 'Interest', 'Dividend', 'Commission', 'Export'];

  form: Partial<Ait> = {};

  private destroy$ = new Subject<void>();

  get aitAmount(): number {
    const gross = this.form?.grossAmount ?? 0;
    const rate = this.form?.aitRate ?? 0;
    return Math.round(gross * rate / 100);
  }

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {

    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMsg  = 'Invalid ait ID. Please go back and try again.';
      return;
    }

    this.aitId = parsedId;
    this.loadAit();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAit(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    this.http.get<Ait>(API_ENDPOINTS.AIT.GET(this.aitId!)).subscribe({
      next: (ait) => {
        this.form = ait;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load AIT data. Please refresh or go back.';
        this.isLoading = false;
      }
    });
  }


  isFormValid(): boolean {
    return !!(this.form?.tinNumber      && 
      (this.form?.grossAmount ?? 0) > 0 && 
      this.form?.deductedBy             && 
      this.form?.fiscalYear             && 
      this.form?.sourceType             && 
      this.form?.status                 && 
      this.form?.deductionDate          && 
      this.form?.taxStructureId);
  }

  
  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';


   this.http.put(API_ENDPOINTS.AIT.UPDATE(this.aitId!), this.form)
    .pipe(takeUntil(this.destroy$)) // Auto-cancel if component is destroyed mid-request
    .subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = 'AIT record updated successfully!';
        setTimeout(() => this.router.navigate(['/ait']), 1500);
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'Failed to update AIT record. Please try again.';
      }
    });
  }

  onCancel(): void { this.router.navigate(['/ait/view', this.aitId]); }
}