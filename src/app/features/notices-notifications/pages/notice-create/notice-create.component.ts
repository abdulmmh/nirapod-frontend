import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { NoticeCreateRequest } from '../../../../models/notice.model';

@Component({
  selector: 'app-notice-create',
  templateUrl: './notice-create.component.html',
  styleUrls: ['./notice-create.component.css']
})
export class NoticeCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  noticeTypes  = ['General', 'Tax Due', 'Audit Notice', 'Penalty Notice', 'Compliance', 'Refund Update', 'System', 'Reminder'];
  priorities   = ['Low', 'Normal', 'High', 'Urgent'];
  targetTypes  = ['All Taxpayers', 'Specific Taxpayer', 'Tax Officers', 'Auditors', 'All Users'];
  officers     = ['Tax Officer', 'Senior Tax Officer', 'Tax Commissioner', 'NBR', 'System Admin'];

  form: NoticeCreateRequest = {
    subject:        '',
    body:           '',
    noticeType:     '',
    priority:       'Normal',
    targetType:     'All Taxpayers',
    tinNumber:      '',
    taxpayerName:   '',
    issuedBy:       '',
    issuedDate:     new Date().toISOString().split('T')[0],
    dueDate:        '',
    attachmentName: ''
  };

  get showTaxpayerFields(): boolean {
    return this.form.targetType === 'Specific Taxpayer';
  }

  isFormValid(): boolean {
    return !!(
      this.form.subject    &&
      this.form.body       &&
      this.form.noticeType &&
      this.form.issuedBy
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

    this.http.post(API_ENDPOINTS.NOTICES.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Notice sent successfully!';
        setTimeout(() => this.router.navigate(['/notices']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = '';
        this.errorMsg   = 'Failed to send notice. Please try again.';
      }
    });
  }

  onReset(): void {
    this.form = {
      subject: '', body: '', noticeType: '',
      priority: 'Normal', targetType: 'All Taxpayers',
      tinNumber: '', taxpayerName: '', issuedBy: '',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: '', attachmentName: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/notices']); }
}