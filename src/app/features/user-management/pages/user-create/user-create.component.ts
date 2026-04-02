import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  roles = ['TAX_COMMISSIONER', 'TAX_OFFICER', 'AUDITOR', 'DATA_ENTRY_OPERATOR', 'TAXPAYER'];
  departments = ['IT Administration', 'Tax Commission', 'VAT Division', 'Income Tax Division', 'Audit Division', 'Data Management', 'External'];
  statuses = ['Active', 'Inactive'];

  form = {
    fullName: '', username: '', email: '', password: '',
    confirmPassword: '', role: '', department: '', status: 'Active'
  };

  get passwordMismatch(): boolean {
    return !!(this.form.password && this.form.confirmPassword &&
              this.form.password !== this.form.confirmPassword);
  }

  isFormValid(): boolean {
    return !!(this.form.fullName && this.form.username &&
              this.form.email && this.form.password &&
              this.form.role && !this.passwordMismatch);
  }

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields correctly.'; return; }
    this.isLoading = true; this.errorMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = 'User created successfully!';
      setTimeout(() => this.router.navigate(['/users']), 1500);
    }, 800);
  }

  onReset(): void {
    this.form = { fullName: '', username: '', email: '', password: '', confirmPassword: '', role: '', department: '', status: 'Active' };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/users']); }
}