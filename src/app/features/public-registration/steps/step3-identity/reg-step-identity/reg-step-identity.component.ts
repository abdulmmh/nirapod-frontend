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
   
    this.hasExistingTin = this.state.hasExistingTin ?? false;

    if (this.state.accountCategory === 'Individual') {
      this.buildIndividualForm();
    } else {
      this.buildCompanyForm();
    }
  }

  get isIndividual(): boolean { return this.state.accountCategory === 'Individual'; }
  ctrl(name: string) { return this.form.get(name); }


  onToggleExistingTin(checked: boolean): void {
    this.hasExistingTin = checked;

    if (this.isIndividual) {
      if (checked) {
        
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
     
      existingTin:  [this.state.existingTin,  []],
      
      nid:          [this.state.nid,          [Validators.required, Validators.pattern(this.nidPattern)]],
      dateOfBirth:  [this.state.dateOfBirth,  [Validators.required]],
      gender:       [this.state.gender,       [Validators.required]],
      profession:   [this.state.profession,   []],
    });

    
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