import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationState } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-identity',
  templateUrl: './reg-step-identity.component.html',
  styleUrls: ['./reg-step-identity.component.css'],
})
export class RegStepIdentityComponent implements OnInit {

  private readonly toast = inject(ToastService);
  @Input()  state!: RegistrationState;
  @Output() next = new EventEmitter<Partial<RegistrationState>>();
  @Output() back = new EventEmitter<void>();

  form!: FormGroup;

  private readonly nidPattern  = /^\d{10}$|^\d{17}$/;
  private readonly rjscPattern = /^[A-Za-z0-9\-\/]{6,20}$/;
  // ← phonePattern removed (phone is Step 2's responsibility)

  readonly maxDob: string = new Date().toISOString().split('T')[0]; // ← ADDED

  readonly genders = ['Male', 'Female', 'Other'];
  readonly professions = [
    'Business', 'Service (Government)', 'Service (Private)',
    'Doctor', 'Engineer', 'Lawyer', 'Teacher', 'Farmer',
    'Freelancer', 'Other',
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.state.accountCategory === 'Individual') {
      this.buildIndividualForm();
    } else {
      this.buildCompanyForm();
    }
  }

  get isIndividual(): boolean { return this.state.accountCategory === 'Individual'; }
  ctrl(name: string) { return this.form.get(name); }

  private buildIndividualForm(): void {
    this.form = this.fb.group({
      nid:         [this.state.nid,         [Validators.required, Validators.pattern(this.nidPattern)]],
      dateOfBirth: [this.state.dateOfBirth, [Validators.required]],
      gender:      [this.state.gender,      [Validators.required]],
      profession:  [this.state.profession,  []],
    });
  }

  private buildCompanyForm(): void {
    this.form = this.fb.group({
      companyName:          [this.state.companyName,          [Validators.required, Validators.minLength(3)]],
      rjscNo:               [this.state.rjscNo,               [Validators.required, Validators.pattern(this.rjscPattern)]],
      incorporationDate:    [this.state.incorporationDate,    [Validators.required]],
      natureOfBusiness:     [this.state.natureOfBusiness,     []],
      authorizedPersonName: [this.state.authorizedPersonName, [Validators.required]],
      authorizedPersonNid:  [this.state.authorizedPersonNid,  [Validators.required, Validators.pattern(this.nidPattern)]],
    });
  }

  onNext(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Please complete the identity information correctly.');
      return;
    }
    this.next.emit(this.form.value);
  }
}
