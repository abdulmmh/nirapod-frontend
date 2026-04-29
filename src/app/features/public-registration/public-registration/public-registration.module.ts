import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';

import { PublicRegistrationRoutingModule } from './public-registration-routing.module';
import { RegisterComponent } from '../register/register.component';
import { RegStepAccountTypeComponent } from '../steps/step1-account-type/reg-step-account-type/reg-step-account-type.component';
import { RegStepCredentialsComponent } from '../steps/step2-credentials/reg-step-credentials/reg-step-credentials.component';
import { RegStepIdentityComponent } from '../steps/step3-identity/reg-step-identity/reg-step-identity.component';
import { RegStepReviewComponent } from '../steps/step4-review/reg-step-review/reg-step-review.component';
import { RegStepSuccessComponent } from '../steps/step5-success/reg-step-success/reg-step-success.component';


@NgModule({
  declarations: [
    RegisterComponent,
    RegStepAccountTypeComponent,
    RegStepCredentialsComponent,
    RegStepIdentityComponent,
    RegStepReviewComponent,
    RegStepSuccessComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    PublicRegistrationRoutingModule
  ]
})
export class PublicRegistrationModule { }
