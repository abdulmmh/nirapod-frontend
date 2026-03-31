import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';

@Component({
  selector: 'app-audit-edit',
  templateUrl: './audit-edit.component.html',
  styleUrls: ['./audit-edit.component.css']
})
export class AuditEditComponent implements OnInit {

  isLoading = true;
  isSaving  = false;
  successMsg = '';
  errorMsg   = '';
  auditId    = 0;

  auditTypes      = ['VAT Audit', 'Income Tax Audit', 'Full Audit', 'Desk Audit', 'Field Audit', 'Special Audit'];
  priorities      = ['Low', 'Medium', 'High', 'Critical'];
  statuses        = ['Scheduled', 'In Progress', 'Completed', 'Flagged', 'Cancelled', 'Pending'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  auditors        = ['Auditor Rahim', 'Auditor Kamal', 'Auditor Nasrin', 'Auditor Faruk', 'Auditor Imran', 'Auditor Reza', 'Senior Auditor Hasan', 'Senior Auditor Mila'];
  supervisors     = ['Tax Commissioner', 'Deputy Commissioner', 'Assistant Commissioner', 'Senior Tax Officer'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.auditId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAudit();
  }

  loadAudit(): void {
    this.isLoading = true;
    this.http.get<Audit>(API_ENDPOINTS.AUDITS.GET(this.auditId)).subscribe({
      next: data => { this.form = { ...data }; this.isLoading = false; },
      error: ()  => {
        this.form = {
          id: this.auditId,
          auditNo: 'AUD-2024-00001',
          tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
          auditType: 'VAT Audit', priority: 'High',
          assessmentYear: '2024-25', returnNo: 'VAT-2024-00001',
          scheduledDate: '2024-03-01', startDate: '2024-03-05',
          completionDate: '2024-03-20',
          assignedTo: 'Auditor Rahim', supervisedBy: 'Tax Commissioner',
          auditFindings: 'Minor discrepancies found',
          taxDemand: 45000, penaltyRecommended: 12000,
          status: 'Completed', remarks: 'Taxpayer notified'
        };
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber && this.form.taxpayerName &&
      this.form.auditType && this.form.priority &&
      this.form.scheduledDate && this.form.assignedTo
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    this.http.put(API_ENDPOINTS.AUDITS.GET(this.auditId), this.form).subscribe({
      next: () => { this.isSaving = false; this.successMsg = 'Audit updated successfully!'; setTimeout(() => this.router.navigate(['/audits']), 1500); },
      error: () => { this.isSaving = false; this.successMsg = ''; this.errorMsg = 'Failed to update audit. Please try again.'; }
    });
  }

  onCancel(): void { this.router.navigate(['/audits', this.auditId]); }
}