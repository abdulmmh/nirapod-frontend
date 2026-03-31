import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.css']
})
export class DocumentEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  documentId = 0;

  documentTypes      = ['NID', 'Trade License', 'TIN Certificate', 'BIN Certificate', 'VAT Return', 'Income Tax Return', 'Bank Statement', 'Audit Report', 'Other'];
  documentCategories = ['Taxpayer', 'Business', 'Return', 'Payment', 'Legal', 'Other'];
  statuses           = ['Pending', 'Verified', 'Rejected', 'Expired', 'Under Review'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.documentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDocument();
  }

  loadDocument(): void {
    this.isLoading = true;
    this.http.get<Document>(API_ENDPOINTS.DOCUMENTS.GET(this.documentId)).subscribe({
      next: data => { this.form = { ...data }; this.isLoading = false; },
      error: ()  => {
        this.form = {
          id: this.documentId,
          documentNo: 'DOC-2024-00001',
          tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
          documentType: 'Trade License', documentCategory: 'Business',
          documentTitle: 'Trade License 2024', referenceNo: 'TL-44821',
          issueDate: '2024-01-01', expiryDate: '2024-12-31',
          submissionDate: '2024-01-10', verificationDate: '2024-01-12',
          fileSize: '2.4 MB', status: 'Verified',
          verifiedBy: 'Tax Officer', remarks: ''
        };
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber && this.form.taxpayerName &&
      this.form.documentType && this.form.documentCategory &&
      this.form.documentTitle
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    this.http.put(API_ENDPOINTS.DOCUMENTS.UPDATE(this.documentId), this.form).subscribe({
      next: () => { this.isSaving = false; this.successMsg = 'Document updated successfully!'; setTimeout(() => this.router.navigate(['/documents']), 1500); },
      error: () => { this.isSaving = false; this.successMsg = ''; this.errorMsg = 'Failed to update document. Please try again.'; }
    });
  }

  onCancel(): void { this.router.navigate(['/documents', this.documentId]); }
}