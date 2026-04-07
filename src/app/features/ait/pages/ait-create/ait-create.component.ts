import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AitCreateRequest } from '../../../../models/ait.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-ait-create',
  templateUrl: './ait-create.component.html',
  styleUrls: ['./ait-create.component.css']
})
export class AitCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  form: AitCreateRequest = this.getEmptyForm();

  sourceTypes   = ['Salary', 'Import', 'Contract', 'Interest', 'Dividend', 'Commission', 'Export'];
  fiscalYears   = ['2024-25', '2023-24', '2022-23'];
  statuses      = ['Draft', 'Deducted'];

  taxpayers = [
    { tin: 'TIN-1001', name: 'Abdul Karim' },
    { tin: 'TIN-1002', name: 'Karim Uddin' },
    { tin: 'TIN-1003', name: 'Dr. Nasrin Islam' },
    { tin: 'TIN-1004', name: 'Faruk Hossain' },
    { tin: 'TIN-1006', name: 'Imran Ahmed' },
  ];

  // AIT tax structures
  aitStructures = [
    { id: 3, name: 'AIT on Salary/Interest/Commission (10%)', sources: ['Salary', 'Interest', 'Commission', 'Dividend'], rate: 10 },
    { id: 4, name: 'AIT on Import (5%)', sources: ['Import'], rate: 5 },
    { id: 8, name: 'AIT on Contract (7%)', sources: ['Contract'], rate: 7 },
  ];

  availableStructures: any[] = [];

  

  onTaxpayerChange(): void {
    const tp = this.taxpayers.find(t => t.tin === this.form.tinNumber);
    if (tp) this.form.taxpayerName = tp.name;
  }

  onSourceChange(): void {
    this.availableStructures = this.aitStructures.filter(s =>
      s.sources.includes(this.form.sourceType)
    );
    this.form.taxStructureId = 0;
    this.form.aitRate = 0;
  }

  onStructureChange(): void {
    const s = this.aitStructures.find(s => s.id === Number(this.form.taxStructureId));
    if (s) this.form.aitRate = s.rate;
  }

  get aitAmount(): number {
    return Math.round(this.form.grossAmount * this.form.aitRate / 100);
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber       && 
              this.form.sourceType      &&
              this.form.grossAmount > 0 && 
              this.form.deductedBy      &&
              this.form.deductionDate   &&
              this.form.fiscalYear      &&
              this.form.taxStructureId  &&  
              this.form.status          &&
              this.form.taxpayerName);
  }
  
  private destroy$ = new Subject<void>();
  
  constructor(private router: Router, private http: HttpClient ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getEmptyForm(): AitCreateRequest {
    return {
      tinNumber: '',
      taxpayerName: '',
      sourceType: '',
      taxStructureId: 0,
      grossAmount: 0,
      aitRate: 0,
      deductionDate: new Date().toISOString().split('T')[0],
      fiscalYear: '2025-26',
      deductedBy: '',
      status: 'Draft',
      remarks: ''
    };
  }


  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; 
    this.errorMsg = ''; 
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.AIT.CREATE, this.form)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'AIT record created successfully!';
        setTimeout(() => this.router.navigate(['/ait']), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to create AIT record. Please try again.';
      }
    });
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.availableStructures = [];
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/ait']); }
}