import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import {
  ImportDuty,
  ImportDutyTaxPreview,
  ImportDutyUpdateRequest,
} from '../../../../models/import-duty.model';
import { TaxableProduct } from '../../../../models/taxable-product.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-import-duty-edit',
  templateUrl: './import-duty-edit.component.html',
  styleUrls: ['./import-duty-edit.component.css'],
})
export class ImportDutyEditComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  isLoading = true;
  isSaving = false;
  isPreviewLoading = false;
  successMsg = '';
  errorMsg = '';
  recordId = 0;

  statuses: string[] = [];
  ports: string[] = [];
  countries: string[] = [];
  products: TaxableProduct[] = [];

  form: ImportDutyUpdateRequest & {
    id?: number;
    dutyRef?: string;
    productName?: string;
    hsCode?: string;
    paidAmount?: number;
  } = this.initialForm();

  selectedProduct: TaxableProduct | null = null;
  taxPreview: ImportDutyTaxPreview | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private masterData: MasterDataService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.recordId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRecordAndMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initialForm(): ImportDutyUpdateRequest {
    return {
      tinNumber: '',
      taxpayerName: '',
      businessName: '',
      productId: 0,
      goodsDescription: '',
      originCountry: '',
      cifValue: 0,
      portOfEntry: '',
      boeNumber: '',
      boeDate: '',
      billOfLading: '',
      importDate: '',
      status: '',
      remarks: '',
    };
  }

  private loadRecordAndMasterData(): void {
    forkJoin({
      record: this.http.get<ImportDuty>(
        API_ENDPOINTS.IMPORT_DUTIES.GET(this.recordId),
      ),
      ports: this.masterData.getImportPorts(),
      countries: this.masterData.getImportCountries(),
      statuses: this.masterData.getImportDutyStatuses(),
      products: this.http.get<TaxableProduct[]>(
        API_ENDPOINTS.TAXABLE_PRODUCTS.LIST,
      ),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.ports = this.toNameList(data.ports);
          this.countries = this.toNameList(data.countries);
          this.statuses = this.toNameList(data.statuses);
          this.products = data.products.filter(
            (product) => product.status !== 'Inactive',
          );
          this.patchForm(data.record);
          this.selectedProduct =
            this.products.find(
              (item) => item.id === Number(this.form.productId),
            ) || null;
          this.taxPreview = this.previewFromRecord(data.record);
        },
        error: () => {
          this.errorMsg = 'Unable to load import duty record.';
          this.toast.error(this.errorMsg);
        },
      });
  }

  private patchForm(record: ImportDuty): void {
    this.form = {
      id: record.id,
      dutyRef: record.dutyRef,
      tinNumber: record.tinNumber,
      taxpayerName: record.taxpayerName,
      businessName: record.businessName,
      productId: record.productId || 0,
      productName: record.productName,
      hsCode: record.hsCode,
      goodsDescription: record.goodsDescription,
      originCountry: record.originCountry,
      cifValue: record.cifValue,
      portOfEntry: record.portOfEntry,
      boeNumber: record.boeNumber,
      boeDate: record.boeDate,
      billOfLading: record.billOfLading,
      importDate: record.importDate,
      status: record.status,
      remarks: record.remarks,
      paidAmount: record.paidAmount,
    };
  }

  private previewFromRecord(record: ImportDuty): ImportDutyTaxPreview {
    return {
      cifValue: record.cifValue,
      customsDuty: record.customsDuty,
      supplementaryDuty: record.supplementaryDuty,
      vat: record.vat,
      advanceIncomeTax: record.advanceIncomeTax,
      advanceTax: record.advanceTax,
      totalPayable: record.totalPayable,
      cdRate: record.cdRate,
      sdRate: record.sdRate,
      vatRate: record.vatRate,
      aitRate: record.aitRate,
      atRate: record.atRate,
    };
  }

  private toNameList(items: any[]): string[] {
    return (items || [])
      .map((item) =>
        typeof item === 'string'
          ? item
          : item?.name || item?.label || item?.value || item?.status,
      )
      .filter((item): item is string => !!item);
  }

  onProductChange(): void {
    this.selectedProduct =
      this.products.find((item) => item.id === Number(this.form.productId)) ||
      null;
    this.calculatePreview();
  }

  onCifValueChange(): void {
    this.calculatePreview();
  }

  calculatePreview(): void {
    this.taxPreview = null;
    if (
      !this.form.productId ||
      !this.form.cifValue ||
      this.form.cifValue <= 0
    ) {
      return;
    }

    this.isPreviewLoading = true;
    this.http
      .get<ImportDutyTaxPreview>(API_ENDPOINTS.IMPORT_DUTIES.PREVIEW, {
        params: {
          productId: String(this.form.productId),
          cifValue: String(this.form.cifValue),
        },
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isPreviewLoading = false)),
      )
      .subscribe({
        next: (preview) => (this.taxPreview = preview),
        error: () => {
          this.errorMsg = 'Unable to calculate the customs tax preview.';
          this.toast.error(this.errorMsg);
        },
      });
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.productId &&
      this.form.cifValue > 0 &&
      this.form.portOfEntry &&
      this.form.boeNumber &&
      this.form.boeDate &&
      this.form.importDate
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    this.http
      .put(
        API_ENDPOINTS.IMPORT_DUTIES.UPDATE(this.recordId),
        this.buildPayload(),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => {
          this.successMsg = 'Import record updated successfully!';
          this.toast.success(this.successMsg);
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/import-duty']));
        },
        error: (err) => {
          this.errorMsg =
            err?.error?.message || 'Unable to update import duty record.';
          this.toast.error(this.errorMsg);
        },
      });
  }

  private buildPayload(): ImportDutyUpdateRequest {
    return {
      tinNumber: this.form.tinNumber,
      taxpayerName: this.form.taxpayerName,
      businessName: this.form.businessName,
      productId: Number(this.form.productId),
      goodsDescription: this.form.goodsDescription,
      originCountry: this.form.originCountry,
      cifValue: Number(this.form.cifValue),
      portOfEntry: this.form.portOfEntry,
      boeNumber: this.form.boeNumber,
      boeDate: this.form.boeDate,
      billOfLading: this.form.billOfLading,
      importDate: this.form.importDate,
      status: this.form.status,
      remarks: this.form.remarks,
    };
  }

  onCancel(): void {
    this.router.navigate(['/import-duty/view', this.recordId]);
  }

  fmt(amount: number | undefined | null): string {
    return `BDT ${(amount || 0).toLocaleString('en-BD')}`;
  }
}
