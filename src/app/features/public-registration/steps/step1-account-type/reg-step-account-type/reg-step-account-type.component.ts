import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccountType, RegistrationState } from '../../../../../models/registration.model';

@Component({
  selector: 'app-reg-step-account-type',
  templateUrl: './reg-step-account-type.component.html',
  styleUrls: ['./reg-step-account-type.component.css'],
})
export class RegStepAccountTypeComponent {
  @Input()  state!: RegistrationState;
  @Output() next   = new EventEmitter<AccountType>();

  select(type: AccountType): void {
    this.next.emit(type);
  }
}
