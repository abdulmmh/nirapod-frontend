import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AitService } from '../../services/ait.service';
import { AitRecord, CreateAitPayload, AitDocument } from '../../models/ait.model';

interface ImportDutyRecord {
  id: number;
  referenceNo: string;
  date: string;
  importerName: string;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  taxableValue: number;
  portOfEntry: string;
  origin: string;
}

interface WizardState {
  step: number;
  selectedTransaction?: ImportDutyRecord;
  calculatedAit?: number;
  uploadedDocuments: File[];
  documentIds: number[];
  formData: Partial<CreateAitPayload>;
  isDraft: boolean;
  draftId?: number;
}

@Component({
  selector: 'app-ait-create-wizard',
  templateUrl: './ait-create-wizard.component.html',
  styleUrls: ['./ait-create-wizard.component.css']
})
export class AitCreateWizardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state: WizardState = {
    step: 1,
    uploadedDocuments: [],
    documentIds: [],
    formData: {},
    isDraft: false
  };

  mockTransactions: ImportDutyRecord[] = [
    {
      id: 101,
      referenceNo: 'BOE-2026-001',
      date: '2026-05-10',
      importerName: 'ABC Import Co.',
      hsCode: '8471.30.10',
      description: 'Computer processors',
      quantity: 100,
      unit: 'Units',
      taxableValue: 50000,
      portOfEntry: 'Dhaka Port',
      origin: 'China'
    },
    {
      id: 102,
      referenceNo: 'BOE-2026-002',
      date: '2026-05-12',
      importerName: 'Tech Solutions Ltd.',
      hsCode: '8517.62.10',
      description: 'Mobile phones',
      quantity: 50,
      unit: 'Units',
      taxableValue: 75000,
      portOfEntry: 'Chittagong Port',
      origin: 'Vietnam'
    },
    {
      id: 103,
      referenceNo: 'BOE-2026-003',
      date: '2026-05-14',
      importerName: 'Fabric Imports Inc.',
      hsCode: '5208.31.00',
      description: 'Cotton fabrics',
      quantity: 500,
      unit: 'Meters',
      taxableValue: 30000,
      portOfEntry: 'Dhaka Port',
      origin: 'India'
    }
  ];

  transactionList: ImportDutyRecord[] = [];
  filteredTransactions: ImportDutyRecord[] = [];
  searchQuery: string = '';
  aitRate: number = 3;
  isSubmitting: boolean = false;
  submitError: string | null = null;
  successMessage: string | null = null;
  newAitRefNo: string | null = null;

  constructor(
    private aitService: AitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.restoreDraftIfExists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    // In real app, fetch from API endpoint for import duty records
    this.transactionList = this.mockTransactions;
    this.filteredTransactions = [...this.transactionList];
  }

  restoreDraftIfExists(): void {
    const draft = sessionStorage.getItem('ait_draft');
    if (draft) {
      const parsed = JSON.parse(draft);
      this.state = parsed;
    }
  }

  saveDraft(): void {
    sessionStorage.setItem('ait_draft', JSON.stringify(this.state));
    alert('Draft saved. You can return to complete this later.');
  }

  discardDraft(): void {
    sessionStorage.removeItem('ait_draft');
    this.router.navigate(['/aits/dashboard']);
  }

  // STEP 1: Transaction Selection
  searchTransactions(): void {
    this.filteredTransactions = this.transactionList.filter(t =>
      t.referenceNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      t.importerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      t.hsCode.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectTransaction(tx: ImportDutyRecord): void {
    this.state.selectedTransaction = tx;
    this.state.formData = {
      importDutyRecordId: tx.id,
      taxableValue: tx.taxableValue,
      hsCode: tx.hsCode,
      aitRate: this.aitRate
    };
    this.calculateAit();
    this.nextStep();
  }

  // STEP 2: Calculate AIT
  calculateAit(): void {
    if (this.state.formData.taxableValue && this.state.formData.aitRate) {
      this.state.calculatedAit = (this.state.formData.taxableValue * this.state.formData.aitRate) / 100;
    }
  }

  onRateChange(newRate: number): void {
    this.state.formData.aitRate = newRate;
    this.calculateAit();
  }

  // STEP 3: Upload Documents
  onFilesSelected(files: FileList | null): void {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      this.state.uploadedDocuments.push(files[i]);
    }
  }

  removeDocument(index: number): void {
    this.state.uploadedDocuments.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // STEP 4: Review & Submit
  async submitAit(): Promise<void> {
    if (!this.state.formData.taxpayerId) {
      this.submitError = 'Taxpayer ID not found. Please log in again.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      // Step 1: Create AIT record (DRAFT)
      const createPayload: CreateAitPayload = {
        taxpayerId: this.state.formData.taxpayerId || 0,
        importDutyRecordId: this.state.formData.importDutyRecordId || 0,
        hsCode: this.state.formData.hsCode,
        taxableValue: this.state.formData.taxableValue || 0,
        aitRate: this.state.formData.aitRate || 0
      };

      const createdAit = await this.aitService.create(createPayload).toPromise();
      if (!createdAit?.id) {
        throw new Error('Failed to create AIT record');
      }

      // Step 2: Upload documents if any
      if (this.state.uploadedDocuments.length > 0) {
        for (const file of this.state.uploadedDocuments) {
          await this.aitService.uploadDocument(createdAit.id, file).toPromise();
        }
      }

      // Step 3: Submit AIT for review (DRAFT → SUBMITTED → PENDING)
      const submittedAit = await this.aitService.submit(createdAit.id, this.state.documentIds).toPromise();

      this.newAitRefNo = submittedAit?.aitReferenceNo || 'Unknown';
      this.successMessage = `AIT successfully created and submitted! Reference: ${this.newAitRefNo}`;
      sessionStorage.removeItem('ait_draft');

      // Redirect after 3 seconds
      timer(3000).pipe(takeUntil(this.destroy$))
        .subscribe(() => this.router.navigate(['/aits/dashboard']));

    } catch (error: any) {
      this.submitError = error?.message || 'Failed to submit AIT. Please try again.';
      this.isSubmitting = false;
    }
  }

  // Navigation
  nextStep(): void {
    if (this.state.step < 4) {
      this.state.step++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.state.step > 1) {
      this.state.step--;
      window.scrollTo(0, 0);
    }
  }

  goToStep(stepNum: number): void {
    if (stepNum < this.state.step || (stepNum === 4 && this.isStepComplete(3))) {
      this.state.step = stepNum;
      window.scrollTo(0, 0);
    }
  }

  isStepComplete(stepNum: number): boolean {
    switch (stepNum) {
      case 1:
        return !!this.state.selectedTransaction;
      case 2:
        return !!this.state.calculatedAit;
      case 3:
        return this.state.uploadedDocuments.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }

  isStepValid(stepNum: number): boolean {
    return this.isStepComplete(stepNum);
  }

  getStepStatus(stepNum: number): 'done' | 'active' | 'pending' {
    if (this.state.step === stepNum) return 'active';
    if (stepNum < this.state.step) return 'done';
    return 'pending';
  }

  getStepLabel(stepNum: number): string {
    const labels = ['', 'Select Transaction', 'Calculate AIT', 'Upload Documents', 'Review & Submit'];
    return labels[stepNum] || '';
  }
}
