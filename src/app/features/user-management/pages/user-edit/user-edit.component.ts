import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  userId = 0;

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
  statuses = ['Active', 'Inactive', 'Suspended'];

  form: any = {};
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.userId,
      fullName: 'Nusrat Jahan',
      username: 'tax_off_01',
      email: 'njahan@nbr.gov.bd',
      role: 'TAX_OFFICER',
      department: 'VAT Division',
      status: 'Active',
    };
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFormValid(): boolean {
    return !!(
      this.form.fullName &&
      this.form.username &&
      this.form.email &&
      this.form.role
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }
    this.isSaving = true;
    timer(800).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isSaving = false;
      this.successMsg = 'User updated successfully!';
      this.toast.success('User updated successfully!');
      timer(1500).pipe(takeUntil(this.destroy$))
        .subscribe(() => this.router.navigate(['/users']));
    });
  }

  onCancel(): void {
    this.router.navigate(['/users/view', this.userId]);
  }
}
