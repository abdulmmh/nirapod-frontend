import { Component, Input, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { RegistrationResponse } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-success',
  templateUrl: './reg-step-success.component.html',
  styleUrls: ['./reg-step-success.component.css'],
})
export class RegStepSuccessComponent {
  @Input() response!: RegistrationResponse;

  constructor(private toast: ToastService, private router: Router) {}

  goToLogin(): void {
    this.toast.info('Redirecting to login.');
    this.router.navigate(['/auth/login']);
  }
}
