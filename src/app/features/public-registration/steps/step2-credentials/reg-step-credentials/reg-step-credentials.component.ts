import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegistrationState } from '../../../../../models/registration.model';

// Cross-field validator: password and confirmPassword must match
function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    if (pw && cpw && pw !== cpw) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-reg-step-credentials',
  templateUrl: './reg-step-credentials.component.html',
  styleUrls: ['./reg-step-credentials.component.css'],
})
export class RegStepCredentialsComponent implements OnInit {
  @Input()  state!: RegistrationState;
  @Output() next = new EventEmitter<Partial<RegistrationState>>();
  @Output() back = new EventEmitter<void>();

  form!: FormGroup;
  showPassword        = false;
  showConfirmPassword = false;

  // BD phone: starts with 01, then 3-9, then 8 digits = 11 digits total
  private readonly phonePattern = /^01[3-9]\d{8}$/;
  // Password: min 8, at least one uppercase, one digit, one special char
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        fullName: [
          this.state.fullName,
          [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
        ],
        email: [
          this.state.email,
          [Validators.required, Validators.email],
        ],
        phone: [
          this.state.phone,
          [Validators.required, Validators.pattern(this.phonePattern)],
        ],
        password: [
          this.state.password,
          [Validators.required, Validators.pattern(this.passwordPattern)],
        ],
        confirmPassword: [
          this.state.confirmPassword,
          Validators.required,
        ],
      },
      { validators: passwordMatchValidator() }
    );
  }

  ctrl(name: string) { return this.form.get(name); }


  //Getters 

  get hasUpperCase(): boolean {
    const v = this.ctrl('password')?.value;
    return v ? /[A-Z]/.test(v) : false;
  }

  get hasNumber(): boolean {
    const v = this.ctrl('password')?.value;
    return v ? /\d/.test(v) : false;
  }

  get hasSpecialChar(): boolean {
    const v = this.ctrl('password')?.value;
    return v ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) : false;
  }

  get hasMinLength(): boolean {
    return (this.ctrl('password')?.value?.length ?? 0) >= 8;
  }

  get passwordMismatch(): boolean {
    return this.form.errors?.['passwordMismatch'] &&
      this.ctrl('confirmPassword')?.touched ? true : false;
  }

  onNext(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.next.emit(this.form.value);
  }
}
