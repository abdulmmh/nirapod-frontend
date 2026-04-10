import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Ait } from 'src/app/models/ait.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-ait-edit',
  templateUrl: './ait-edit.component.html',
  styleUrls: ['./ait-edit.component.css']
})
export class AitEditComponent implements OnInit {

  // ──────────────── States ────────────────
  isLoading  = true;
  isSaving   = false;
  aitId : number | null = null;

  form: Partial<Ait> = {};

  private destroy$ = new Subject<void>();

  // ──────────────── Static Data ────────────────

  statuses    = ['Draft', 'Deducted', 'Deposited', 'Credited', 'Disputed'];
  fiscalYears = ['2024-25', '2023-24', '2022-23'];
  sourceTypes = ['Salary', 'Import', 'Contract', 'Interest', 'Dividend', 'Commission', 'Export'];

  


  // ─────────  Getter ───────────────

  get aitAmount(): number {
    const gross = this.form?.grossAmount ?? 0;
    const rate = this.form?.aitRate ?? 0;
    return Math.round(gross * rate / 100);
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
    this.initializeAit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  } 


  // ─────────── Initialization  ─────────────

  private initializeAit(): void {
    const id = this.getValidAitId();
    
    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.aitId = id;
    this.fetchAit();
  }


  // ───────────  Data Fetching ───────────────

  private fetchAit(): void {
    if (!this.aitId) return;

    this.isLoading = true;

    this.http
      .get<Ait>(API_ENDPOINTS.AITS.GET(this.aitId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Ait): void {
    this.form = { ...data };
  }

  private handleFetchError(error: any): void {
    this.toast.error('Failed to load AIT record');
    this.router.navigate(['/ait/list']);
  }



  
  // ───────────  Validation ───────────────

  isFormValid(): boolean {
    return !!(
      this.form?.tinNumber              && 
      (this.form?.grossAmount ?? 0) > 0 && 
      this.form?.deductedBy             && 
      this.form?.fiscalYear             && 
      this.form?.sourceType             && 
      this.form?.status                 && 
      this.form?.deductionDate          && 
      this.form?.taxStructureId
    );
  }

  private getValidAitId(): number | null {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  }

  private handleInvalidId(): void {
    this.toast.error('Invalid AIT ID provided');
    this.router.navigate(['/ait/list']);
  }

  // ───────────  Actions ───────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    if (!this.aitId) {
      this.handleInvalidId();
      return;
    }

    this.isSaving = true;
    this.updateAit();
  }

  private updateAit(): void {
    this.http
      .put(API_ENDPOINTS.AITS.UPDATE(this.aitId!), this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: (error) => this.handleUpdateError(error),
      });
  }

  private handleUpdateSuccess(): void {
    this.toast.success('AIT record updated successfully');
    this.router.navigate(['/ait/view', this.aitId]);
  }
  
  private handleUpdateError(error: any): void {
    console.error('Update error:', error);
    this.toast.error('Failed to update AIT record');
  }
  
  private showValidationWarning(): void {
    this.toast.warning('Please fill all required fields correctly');
  }

  // ──────────────── Events ────────────────
  onCancel(): void { this.router.navigate(['/ait/view', this.aitId]); }
}