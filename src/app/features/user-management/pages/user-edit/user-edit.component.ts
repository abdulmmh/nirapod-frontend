import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  userId     = 0;

  roles       = ['TAX_COMMISSIONER', 'TAX_OFFICER', 'AUDITOR', 'DATA_ENTRY_OPERATOR', 'TAXPAYER'];
  departments = ['IT Administration', 'Tax Commission', 'VAT Division', 'Income Tax Division', 'Audit Division', 'Data Management', 'External'];
  statuses    = ['Active', 'Inactive', 'Suspended'];

  form: any = {};

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.userId, fullName: 'Nusrat Jahan',
      username: 'tax_off_01', email: 'njahan@nbr.gov.bd',
      role: 'TAX_OFFICER', department: 'VAT Division', status: 'Active'
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.fullName && this.form.username &&
              this.form.email && this.form.role);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'User updated successfully!';
      setTimeout(() => this.router.navigate(['/users']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/users/view', this.userId]); }
}