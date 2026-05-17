import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import {
  ImportDutyCreateRequest,
  ImportDutyTaxPreview,
} from '../../../../models/import-duty.model';
import { TaxableProduct } from '../../../../models/taxable-product.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

interface TaxpayerOption {
  tin?: string;
  tinNumber?: string;
  name?: string;
  taxpayerName?: string;
  fullName?: string;
  business?: string;
  businessName?: string;
}

@Component({
  selector: 'app-import-duty-create',
  templateUrl: './import-duty-create.component.html',
  styleUrls: ['./import-duty-create.component.css'],
})
export class ImportDutyCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  isLoading = false;
  isMasterDataLoading = true;
  isPreviewLoading = false;
  successMsg = '';
  errorMsg = '';

  ports: string[] = [];
  statuses: string[] = [];
  countries: string[] = [];
  taxpayers: TaxpayerOption[] = [];
  products: TaxableProduct[] = [];

  selectedProduct: TaxableProduct | null = null;
  selectedTaxpayer: TaxpayerOption | null = null;
  taxPreview: ImportDutyTaxPreview | null = null;

  form: ImportDutyCreateRequest = this.initialForm();

  constructor(
    private router: Router,
    private http: HttpClient,
    private masterData: MasterDataService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initialForm(): ImportDutyCreateRequest {
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
      importDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      remarks: '',
    };
  }

  private loadMasterData(): void {
    forkJoin({
      ports: this.masterData.getImportPorts(),
      countries: this.masterData.getImportCountries(),
      statuses: this.masterData.getImportDutyStatuses(),
      taxpayers: this.masterData.getActiveTaxpayers(),
      products: this.http.get<TaxableProduct[]>(
        API_ENDPOINTS.TAXABLE_PRODUCTS.LIST,
      ),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isMasterDataLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.ports = this.toNameList(data.ports);
          this.countries = this.toNameList(data.countries);
          this.statuses = this.toNameList(data.statuses);
          this.taxpayers = data.taxpayers;
          this.products = data.products.filter(
            (product) => product.status !== 'Inactive',
          );
          if (!this.statuses.includes(this.form.status)) {
            this.form.status = this.statuses[0] || '';
          }
        },
        error: () => {
          this.errorMsg = 'Unable to load import duty master data.';
          this.toast.error(this.errorMsg);
        },
      });
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

  onTaxpayerChange(): void {
    const tp = this.taxpayers.find(
      (item) => this.getTin(item) === this.form.tinNumber,
    );
    this.selectedTaxpayer = tp || null;
    this.form.taxpayerName = tp ? this.getTaxpayerName(tp) : '';
    this.form.businessName = tp ? this.getBusinessName(tp) : '';
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

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http
      .post(API_ENDPOINTS.IMPORT_DUTIES.CREATE, this.buildPayload())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.successMsg = 'Import duty record created successfully!';
          this.toast.success(this.successMsg);
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/import-duty']));
        },
        error: (err) => {
          this.errorMsg =
            err?.error?.message || 'Unable to create import duty record.';
          this.toast.error(this.errorMsg);
        },
      });
  }

  private buildPayload(): ImportDutyCreateRequest {
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

  onReset(): void {
    this.form = this.initialForm();
    this.selectedProduct = null;
    this.selectedTaxpayer = null;
    this.taxPreview = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/import-duty']);
  }

  getTin(taxpayer: TaxpayerOption): string {
    return taxpayer.tinNumber || taxpayer.tin || '';
  }

  getTaxpayerName(taxpayer: TaxpayerOption): string {
    return taxpayer.taxpayerName || taxpayer.fullName || taxpayer.name || '';
  }

  getBusinessName(taxpayer: TaxpayerOption): string {
    return taxpayer.businessName || taxpayer.business || '';
  }

  fmt(amount: number | undefined | null): string {
    return `BDT ${(amount || 0).toLocaleString('en-BD')}`;
  }
}
