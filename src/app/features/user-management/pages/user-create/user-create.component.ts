import { Component, OnDestroy, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent implements OnDestroy {
  isLoading = false;
  successMsg = '';
  errorMsg = '';
  private destroy$ = new Subject<void>();

  roles = [
    'TAX_COMMISSIONER',
    'TAX_OFFICER',
    'AUDITOR',
    'DATA_ENTRY_OPERATOR',
    'TAXPAYER',
  ];
  departments = [
    'IT Administration',
    'Tax Commission',
    'VAT Division',
    'Income Tax Division',
    'Audit Division',
    'Data Management',
    'External',
  ];
  statuses = ['Active', 'Inactive'];

  form = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    status: 'Active',
  };

  get passwordMismatch(): boolean {
    return !!(
      this.form.password &&
      this.form.confirmPassword &&
      this.form.password !== this.form.confirmPassword
    );
  }

  isFormValid(): boolean {
    return !!(
      this.form.fullName &&
      this.form.username &&
      this.form.email &&
      this.form.password &&
      this.form.role &&
      !this.passwordMismatch
    );
  }

  constructor(private router: Router, private toast: ToastService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields correctly.';
      this.toast.error('Please fill in all required fields correctly.');
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    timer(800).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoading = false;
      this.successMsg = 'User created successfully!';
      this.toast.success('User created successfully!');
      timer(1500).pipe(takeUntil(this.destroy$))
        .subscribe(() => this.router.navigate(['/users']));
    });
  }

  onReset(): void {
    this.form = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      status: 'Active',
    };
    this.errorMsg = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
