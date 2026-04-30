import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegistrationState } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-review',
  templateUrl: './reg-step-review.component.html',
  styleUrls: ['./reg-step-review.component.css'],
})
export class RegStepReviewComponent {
  @Input()  state!: RegistrationState;
  @Input()  isSubmitting = false;
  @Output() submit = new EventEmitter<void>();
  @Output() back   = new EventEmitter<void>();

  get isIndividual(): boolean { return this.state.accountCategory === 'Individual'; }

  // Mask password display
  get maskedPassword(): string { return '•'.repeat(this.state.password.length); }
}