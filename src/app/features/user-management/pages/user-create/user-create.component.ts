import { Component, OnDestroy } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user.service';

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
  statuses: ('Active' | 'Inactive' | 'Suspended')[] = ['Active', 'Inactive', 'Suspended'];

  form = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
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

  constructor(
    private userService: UserService,
    private router: Router,
    private toast: ToastService
  ) {}

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

    const newUser = {
      fullName: this.form.fullName,
      username: this.form.username,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role,
      department: this.form.department,
      status: this.form.status,
    };

    this.userService.create(newUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMsg = 'User created successfully!';
          this.toast.success('User created successfully!');
          setTimeout(() => this.router.navigate(['/user-management']), 1500);
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || 'Failed to create user';
          this.errorMsg = message;
          this.toast.error(message);
        }
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
    this.router.navigate(['/user-management']);
  }
}
