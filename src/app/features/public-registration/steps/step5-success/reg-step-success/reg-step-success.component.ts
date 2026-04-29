import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationResponse } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-success',
  templateUrl: './reg-step-success.component.html',
  styleUrls: ['./reg-step-success.component.css'],
})
export class RegStepSuccessComponent {
  @Input() response!: RegistrationResponse;

  constructor(private router: Router) {}

  goToLogin(): void { this.router.navigate(['/auth/login']); }
}
