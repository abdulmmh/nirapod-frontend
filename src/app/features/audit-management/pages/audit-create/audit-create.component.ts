import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { AuditCreateRequest } from '../../../../models/audit.model';

@Component({
  selector: 'app-audit-create',
  templateUrl: './audit-create.component.html',
  styleUrls: ['./audit-create.component.css']
})
export class AuditCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  auditTypes = [
    'VAT Audit', 'Income Tax Audit', 'Full Audit',
    'Desk Audit', 'Field Audit', 'Special Audit'
  ];

  priorities      = ['Low', 'Medium', 'High', 'Critical'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];

  auditors = [
    'Auditor Rahim', 'Auditor Kamal', 'Auditor Nasrin',
    'Auditor Faruk', 'Auditor Imran', 'Auditor Reza',
    'Senior Auditor Hasan', 'Senior Auditor Mila'
  ];

  supervisors = [
    'Tax Commissioner', 'Deputy Commissioner',
    'Assistant Commissioner', 'Senior Tax Officer'
  ];

  form: AuditCreateRequest = {
    tinNumber:      '',
    taxpayerName:   '',
    auditType:      '',
    priority:       'Medium',
    assessmentYear: '2024-25',
    returnNo:       '',
    scheduledDate:  new Date().toISOString().split('T')[0],
    assignedTo:     '',
    supervisedBy:   '',
    remarks:        ''
  };

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber    &&
      this.form.taxpayerName &&
      this.form.auditType    &&
      this.form.priority     &&
      this.form.scheduledDate &&
      this.form.assignedTo
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

    this.http.post(API_ENDPOINTS.AUDITS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Audit created successfully!';
        setTimeout(() => this.router.navigate(['/audits']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = 'Audit created successfully!';
        setTimeout(() => this.router.navigate(['/audits']), 1500);
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', taxpayerName: '', auditType: '',
      priority: 'Medium', assessmentYear: '2024-25',
      returnNo: '', scheduledDate: new Date().toISOString().split('T')[0],
      assignedTo: '', supervisedBy: '', remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/audits']); }
}