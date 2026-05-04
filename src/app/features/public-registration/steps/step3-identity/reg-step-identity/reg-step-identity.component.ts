import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationState } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-identity',
  templateUrl: './reg-step-identity.component.html',
  styleUrls: ['./reg-step-identity.component.css'],
})
export class RegStepIdentityComponent implements OnInit {
  @Input()  state!: RegistrationState;
  @Output() next = new EventEmitter<Partial<RegistrationState>>();
  @Output() back = new EventEmitter<void>();

  form!: FormGroup;

  /** Mirrors the toggle checkbox — drives conditional validation & template */
  hasExistingTin = false;

  private readonly nidPattern      = /^\d{10}$|^\d{17}$/;
  private readonly rjscPattern     = /^[A-Za-z0-9\-\/]{6,20}$/;
  private readonly existingTinPat  = /^TIN-\d{8}-[A-Z0-9]{8}$/i;

  readonly maxDob: string = new Date().toISOString().split('T')[0];

  readonly genders = ['Male', 'Female', 'Other'];
  readonly professions = [
    'Business', 'Service (Government)', 'Service (Private)',
    'Doctor', 'Engineer', 'Lawyer', 'Teacher', 'Farmer',
    'Freelancer', 'Other',
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Restore toggle state when navigating back
    this.hasExistingTin = this.state.hasExistingTin ?? false;

    if (this.state.accountCategory === 'Individual') {
      this.buildIndividualForm();
    } else {
      this.buildCompanyForm();
    }
  }

  get isIndividual(): boolean { return this.state.accountCategory === 'Individual'; }
  ctrl(name: string) { return this.form.get(name); }

  /**
   * Called when the "I already have a TIN" checkbox is toggled.
   * Swaps validation: when ON, only existingTin is required.
   * When OFF, the normal NID / date-of-birth / gender fields are required.
   */
  onToggleExistingTin(checked: boolean): void {
    this.hasExistingTin = checked;

    if (this.isIndividual) {
      if (checked) {
        // Disable mandatory identity fields — only existingTin required
        this.ctrl('nid')?.clearValidators();
        this.ctrl('nid')?.updateValueAndValidity();
        this.ctrl('dateOfBirth')?.clearValidators();
        this.ctrl('dateOfBirth')?.updateValueAndValidity();
        this.ctrl('gender')?.clearValidators();
        this.ctrl('gender')?.updateValueAndValidity();
        this.ctrl('existingTin')?.setValidators([
          Validators.required,
          Validators.pattern(this.existingTinPat),
        ]);
        this.ctrl('existingTin')?.updateValueAndValidity();
      } else {
        // Restore mandatory fields
        this.ctrl('nid')?.setValidators([Validators.required, Validators.pattern(this.nidPattern)]);
        this.ctrl('nid')?.updateValueAndValidity();
        this.ctrl('dateOfBirth')?.setValidators([Validators.required]);
        this.ctrl('dateOfBirth')?.updateValueAndValidity();
        this.ctrl('gender')?.setValidators([Validators.required]);
        this.ctrl('gender')?.updateValueAndValidity();
        this.ctrl('existingTin')?.clearValidators();
        this.ctrl('existingTin')?.updateValueAndValidity();
      }
    } else {
      // Company form: existingTin only
      if (checked) {
        this.ctrl('existingTin')?.setValidators([
          Validators.required,
          Validators.pattern(this.existingTinPat),
        ]);
      } else {
        this.ctrl('existingTin')?.clearValidators();
      }
      this.ctrl('existingTin')?.updateValueAndValidity();
    }
  }

  private buildIndividualForm(): void {
    this.form = this.fb.group({
      // TIN toggle input — starts optional, becomes required when toggled on
      existingTin:  [this.state.existingTin,  []],
      // Identity fields — required by default, cleared when existingTin toggled on
      nid:          [this.state.nid,          [Validators.required, Validators.pattern(this.nidPattern)]],
      dateOfBirth:  [this.state.dateOfBirth,  [Validators.required]],
      gender:       [this.state.gender,       [Validators.required]],
      profession:   [this.state.profession,   []],
    });

    // If navigating back with toggle on, re-apply correct validators
    if (this.hasExistingTin) {
      this.onToggleExistingTin(true);
    }
  }

  private buildCompanyForm(): void {
    this.form = this.fb.group({
      existingTin:          [this.state.existingTin,          []],
      companyName:          [this.state.companyName,          [Validators.required, Validators.minLength(3)]],
      rjscNo:               [this.state.rjscNo,               [Validators.required, Validators.pattern(this.rjscPattern)]],
      incorporationDate:    [this.state.incorporationDate,    [Validators.required]],
      natureOfBusiness:     [this.state.natureOfBusiness,     []],
      authorizedPersonName: [this.state.authorizedPersonName, [Validators.required]],
      authorizedPersonNid:  [this.state.authorizedPersonNid,  [Validators.required, Validators.pattern(this.nidPattern)]],
    });

    if (this.hasExistingTin) {
      this.onToggleExistingTin(true);
    }
  }

  onNext(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.next.emit({
      ...this.form.value,
      hasExistingTin: this.hasExistingTin,
    });
  }
}