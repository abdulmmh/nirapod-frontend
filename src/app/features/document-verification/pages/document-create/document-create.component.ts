import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { DocumentCreateRequest } from '../../../../models/document.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.css']
})
export class DocumentCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  form: DocumentCreateRequest = this.getEmptyForm();

  documentTypes = [
    'NID', 'Trade License', 'TIN Certificate', 'BIN Certificate',
    'VAT Return', 'Income Tax Return', 'Bank Statement', 'Audit Report', 'Other'
  ];

  documentCategories = [
    'Taxpayer', 'Business', 'Return', 'Payment', 'Legal', 'Other'
  ];

  private destroy$ = new Subject<void>();


  private getEmptyForm(): DocumentCreateRequest {
    return {
      tinNumber: '', 
      taxpayerName: '', 
      documentType: '',  
      documentCategory: '',
      documentTitle: '', 
      referenceNo: '', 
      issueDate: '',
      expiryDate: '', 
      submissionDate: new Date().toISOString().split('T')[0],
      remarks: ''
    };
  }
  

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber        &&
      this.form.taxpayerName     &&
      this.form.documentType     &&
      this.form.documentCategory &&
      this.form.documentTitle    &&
      this.form.issueDate        &&
      this.form.submissionDate
    );
  }
    

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.DOCUMENTS.CREATE, this.form)
    .pipe(takeUntil(this.destroy$)) 
    .subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Document submitted successfully!';
        setTimeout(() => this.router.navigate(['/documents']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.errorMsg   = 'Failed to submit document. Please try again.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.errorMsg = ''; 
    this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/documents']); }
}