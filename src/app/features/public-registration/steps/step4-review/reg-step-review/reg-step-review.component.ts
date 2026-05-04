import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { RegistrationState } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-review',
  templateUrl: './reg-step-review.component.html',
  styleUrls: ['./reg-step-review.component.css'],
})
export class RegStepReviewComponent {
  @Input() state!: RegistrationState;
  @Input() isSubmitting = false;
  @Output() submit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  constructor(private toast: ToastService) {}
  get isIndividual(): boolean {
    return this.state.accountCategory === 'Individual';
  }

  // Mask password display
  get maskedPassword(): string {
    return '•'.repeat(this.state.password.length);
  }
  onSubmit(): void {
    this.toast.info('Submitting registration request...');
    this.submit.emit();
  }
}
