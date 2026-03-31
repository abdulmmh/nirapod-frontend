import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { DocumentCreateRequest } from '../../../../models/document.model';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.css']
})
export class DocumentCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  documentTypes = [
    'NID', 'Trade License', 'TIN Certificate', 'BIN Certificate',
    'VAT Return', 'Income Tax Return', 'Bank Statement', 'Audit Report', 'Other'
  ];

  documentCategories = [
    'Taxpayer', 'Business', 'Return', 'Payment', 'Legal', 'Other'
  ];

  form: DocumentCreateRequest = {
    tinNumber:        '',
    taxpayerName:     '',
    documentType:     '',
    documentCategory: '',
    documentTitle:    '',
    referenceNo:      '',
    issueDate:        '',
    expiryDate:       '',
    submissionDate:   new Date().toISOString().split('T')[0],
    remarks:          ''
  };

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber        &&
      this.form.taxpayerName     &&
      this.form.documentType     &&
      this.form.documentCategory &&
      this.form.documentTitle
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

    this.http.post(API_ENDPOINTS.DOCUMENTS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Document submitted successfully!';
        setTimeout(() => this.router.navigate(['/documents']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = '';
        this.errorMsg   = 'Failed to submit document. Please try again.';
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', taxpayerName: '', documentType: '',
      documentCategory: '', documentTitle: '', referenceNo: '',
      issueDate: '', expiryDate: '',
      submissionDate: new Date().toISOString().split('T')[0],
      remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/documents']); }
}