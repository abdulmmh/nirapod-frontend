import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { Ait, AitCreateRequest, AitSourceType, AitStatus } from 'src/app/models/ait.model';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-ait-edit',
  templateUrl: './ait-edit.component.html',
  styleUrls: ['./ait-edit.component.css']
})
export class AitEditComponent implements OnInit, OnDestroy {

  isLoading  = true;
  isSaving   = false;
  aitId: number | null = null;
  aitRef = '';
  taxpayerName = '';
  maxDate = new Date().toISOString().split('T')[0];

  form: AitCreateRequest = this.getEmptyForm();
  previewAitAmount = 0;

  statuses: AitStatus[] = [];
  fiscalYears: string[] = [];
  sourceTypes: AitSourceType[] = [];
  availableStructures: Partial<TaxStructure>[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private masterData: MasterDataService,
  ) {}

  ngOnInit(): void {
    this.initializeAit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedAitRate(): number {
    const structure = this.availableStructures.find(
      (s) => s.id === Number(this.form.taxStructureId),
    );
    return structure?.rate ?? 0;
  }

  get requiresDepositProof(): boolean {
    return this.form.status === 'Deposited' || this.form.status === 'Credited';
  }

  private initializeAit(): void {
    const id = this.getValidAitId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.aitId = id;
    this.loadPageData(id);
  }

  private loadPageData(id: number): void {
    this.isLoading = true;

    forkJoin({
      ait: this.http.get<Ait>(API_ENDPOINTS.AITS.GET(id)),
      sourceTypes: this.masterData.getAitSourceTypes(),
      statuses: this.masterData.getAitStatuses(),
      fiscalYears: this.masterData.getFiscalYears(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: ({ ait, sourceTypes, statuses, fiscalYears }) => {
          this.sourceTypes = sourceTypes;
          this.statuses = statuses;
          this.fiscalYears = fiscalYears.map(fy => fy.yearName);
          this.handleFetchSuccess(ait);
        },
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Ait): void {
    this.aitRef = data.aitRef;
    this.taxpayerName = data.taxpayerName;
    this.form = {
      tinNumber: data.tinNumber,
      taxpayerName: data.taxpayerName,
      sourceType: data.sourceType,
      taxStructureId: data.taxStructureId,
      grossAmount: data.grossAmount,
      deductionDate: data.deductionDate,
      depositDate: data.depositDate ?? '',
      challanNumber: data.challanNumber ?? '',
      bankName: data.bankName ?? '',
      attachmentUrl: data.attachmentUrl ?? '',
      fiscalYear: data.fiscalYear,
      deductedBy: data.deductedBy,
      status: data.status,
      remarks: data.remarks ?? '',
    };
    this.loadStructuresBySource(data.sourceType);
  }

  private handleFetchError(error: unknown): void {
    console.error('Failed to load AIT record', error);
    this.toast.error('Failed to load AIT record');
    this.router.navigate(['/ait/list']);
  }

  private loadStructuresBySource(source: AitSourceType): void {
    if (!source) return;

    this.http
      .get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.BY_SOURCE(source))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.availableStructures = res;
          this.updatePreviewAmount();
        },
        error: () => this.toast.error('Failed to load tax structures'),
      });
  }

  onSourceChange(): void {
    this.availableStructures = [];
    this.form.taxStructureId = 0;
    this.previewAitAmount = 0;
    this.loadStructuresBySource(this.form.sourceType);
  }

  onStructureChange(): void {
    this.updatePreviewAmount();
  }

  onGrossAmountChange(): void {
    this.updatePreviewAmount();
  }

  onStatusChange(): void {
    if (!this.requiresDepositProof) {
      this.form.challanNumber = '';
      this.form.bankName = '';
      this.form.attachmentUrl = '';
    }
  }

  private updatePreviewAmount(): void {
    const gross = Number(this.form.grossAmount) || 0;
    const rate = this.selectedAitRate;
    this.previewAitAmount = gross > 0 && rate > 0
      ? Math.round((gross * rate) / 100)
      : 0;
  }

  isFormValid(): boolean {
    const f = this.form;
    const hasDepositProof = !this.requiresDepositProof ||
      !!(f.challanNumber.trim() && f.bankName.trim() && f.depositDate);

    return !!(
      f.tinNumber &&
      f.grossAmount > 0 &&
      f.deductedBy &&
      f.fiscalYear &&
      f.sourceType &&
      f.status &&
      f.deductionDate &&
      f.taxStructureId &&
      hasDepositProof
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

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill all required fields correctly');
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

  private handleUpdateError(error: unknown): void {
    console.error('Update error:', error);
    this.toast.error('Failed to update AIT record');
  }

  onCancel(): void {
    this.router.navigate(['/ait/view', this.aitId]);
  }

  private getEmptyForm(): AitCreateRequest {
    return {
      tinNumber: '',
      taxpayerName: '',
      sourceType: '' as AitSourceType,
      taxStructureId: 0,
      grossAmount: 0,
      deductionDate: this.maxDate,
      depositDate: '',
      challanNumber: '',
      bankName: '',
      attachmentUrl: '',
      fiscalYear: '',
      deductedBy: '',
      status: 'Draft',
      remarks: '',
    };
  }
}
