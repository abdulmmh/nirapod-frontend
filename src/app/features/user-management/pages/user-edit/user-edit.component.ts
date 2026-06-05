import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserService } from '../../services/user.service';
import { ASSIGNABLE_ROLES, DEPARTMENTS } from 'src/app/shared/helpers/role-display.helper';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit, OnDestroy {

  isLoading = true;
  isSaving  = false;
  userId    = 0;

  readonly roles       = ASSIGNABLE_ROLES;
  readonly departments = DEPARTMENTS;
  readonly statuses    = ['Active', 'Inactive', 'Suspended'];

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb:          FormBuilder,
    private route:       ActivatedRoute,
    private router:      Router,
    private userService: UserService,
    private toast:       ToastService,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    // Initialise the form immediately so the template never sees an undefined form
    this.form = this.fb.group({
      fullName:   ['', [Validators.required, Validators.minLength(3)]],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      email:      ['', [Validators.required, Validators.email]],
      role:       ['', Validators.required],
      department: [''],
      status:     ['Active', Validators.required],
    });

    // Load the real user from the API
    this.userService.getById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            fullName:   user.fullName,
            username:   user.username ?? '',
            email:      user.email,
            role:       user.role,
            department: user.department ?? '',
            status:     user.status,
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || 'Failed to load user.';
          this.toast.error(message);
          this.router.navigate(['/users']);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Convenience accessor for template
  get f() { return this.form.controls; }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Please fill in all required fields correctly.');
      return;
    }

    this.isSaving = true;

    this.userService.update(this.userId, this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toast.success('User updated successfully!');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isSaving = false;
          const message = err?.error?.message || 'Failed to update user.';
          this.toast.error(message);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/users/view', this.userId]);
  }
}