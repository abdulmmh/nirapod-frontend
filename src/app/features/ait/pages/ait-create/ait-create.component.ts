import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { AitCreateRequest, AitSourceType, AitStatus } from '../../../../models/ait.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Taxpayer } from 'src/app/models/taxpayer.model';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { MasterDataService } from 'src/app/core/services/master-data.service';

@Component({
  selector: 'app-ait-create',
  templateUrl: './ait-create.component.html',
  styleUrls: ['./ait-create.component.css'],
})
export class AitCreateComponent implements OnInit, OnDestroy {

  isLoading = false;
  isMasterDataLoading = false;
  maxDate = new Date().toISOString().split('T')[0];

  form: AitCreateRequest = this.getEmptyForm();
  previewAitAmount = 0;

  taxpayers: Partial<Taxpayer>[] = [];
  availableStructures: Partial<TaxStructure>[] = [];
  sourceTypes: AitSourceType[] = [];
  statuses: AitStatus[] = [];
  fiscalYears: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private masterData: MasterDataService,
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMasterData(): void {
    this.isMasterDataLoading = true;

    forkJoin({
      taxpayers: this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST),
      sourceTypes: this.masterData.getAitSourceTypes(),
      statuses: this.masterData.getAitStatuses(),
      fiscalYears: this.masterData.getFiscalYears(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isMasterDataLoading = false)),
      )
      .subscribe({
        next: ({ taxpayers, sourceTypes, statuses, fiscalYears }) => {
          this.taxpayers = taxpayers;
          this.sourceTypes = sourceTypes;
          this.statuses = statuses;
          this.fiscalYears = fiscalYears.map(fy => fy.yearName);
          this.form.fiscalYear = this.fiscalYears[0] ?? '';
          this.form.status = this.statuses[0] ?? 'Draft';
        },
        error: () => this.toast.error('Failed to load AIT master data. Please refresh the page.'),
      });
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

  onTaxpayerChange(): void {
    const tp = this.taxpayers.find((t) => t.tinNumber === this.form.tinNumber);
    if (tp) this.form.taxpayerName = tp.fullName ?? '';
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

  get selectedAitRate(): number {
    const structure = this.availableStructures.find(
      (s) => s.id === Number(this.form.taxStructureId),
    );
    return structure?.rate ?? 0;
  }

  get requiresDepositProof(): boolean {
    return this.form.status === 'Deposited' || this.form.status === 'Credited';
  }

  private updatePreviewAmount(): void {
    const gross = Number(this.form.grossAmount) || 0;
    const rate = this.selectedAitRate;
    this.previewAitAmount = gross > 0 && rate > 0
      ? Math.round((gross * rate) / 100)
      : 0;
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

  isFormValid(): boolean {
    const f = this.form;
    const hasDepositProof = !this.requiresDepositProof ||
      !!(f.challanNumber.trim() && f.bankName.trim() && f.depositDate);

    return !!(
      f.tinNumber &&
      f.taxpayerName &&
      f.sourceType &&
      f.taxStructureId &&
      f.grossAmount > 0 &&
      f.deductedBy &&
      f.deductionDate &&
      f.fiscalYear &&
      f.status &&
      hasDepositProof
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    this.http
      .post(API_ENDPOINTS.AITS.CREATE, this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
  }

  private handleSuccess(): void {
    this.toast.success('AIT record created successfully!');
    timer(1500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['..'],
        { relativeTo: this.route }
      ));
  }

  private handleError(error: unknown): void {
    console.error(error);
    this.toast.error('Failed to create AIT record.');
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.form.fiscalYear = this.fiscalYears[0] ?? '';
    this.form.status = this.statuses[0] ?? 'Draft';
    this.availableStructures = [];
    this.previewAitAmount = 0;
  }

  onCancel(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['..'], {
        relativeTo: this.route
      });
    }
  }
}
