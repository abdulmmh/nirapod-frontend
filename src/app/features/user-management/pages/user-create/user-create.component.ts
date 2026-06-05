import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserService } from '../../services/user.service';
import { ASSIGNABLE_ROLES, DEPARTMENTS } from 'src/app/shared/helpers/role-display.helper';

// Cross-field validator: password === confirmPassword
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent implements OnDestroy {

  isLoading = false;
  readonly roles       = ASSIGNABLE_ROLES;
  readonly departments = DEPARTMENTS;
  readonly statuses: ('Active' | 'Inactive' | 'Suspended')[] = ['Active', 'Inactive', 'Suspended'];

  form: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb:          FormBuilder,
    private userService: UserService,
    private router:      Router,
    private toast:       ToastService,
  ) {
    this.form = this.fb.group(
      {
        fullName:        ['', [Validators.required, Validators.minLength(3)]],
        username:        ['', [Validators.required, Validators.minLength(3)]],
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        role:            ['', Validators.required],
        department:      [''],
        status:          ['Active', Validators.required],
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Convenience accessors for template readability
  get f() { return this.form.controls; }

  get passwordMismatch(): boolean {
    return !!(
      this.form.hasError('passwordMismatch') &&
      this.f['confirmPassword'].touched
    );
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    const { confirmPassword, ...payload } = this.form.value;

    this.userService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success('User created successfully!');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || 'Failed to create user.';
          this.toast.error(message);
        },
      });
  }

  onReset(): void {
    this.form.reset({ status: 'Active' });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}