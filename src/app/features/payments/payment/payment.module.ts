import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentRoutingModule } from './payment-routing.module';

import { PaymentEditComponent } from '../pages/payment-edit/payment-edit.component';
import { PaymentViewComponent } from '../pages/payment-view/payment-view.component';
import { PaymentCreateComponent } from '../pages/payment-create/payment-create.component';
import { PaymentListComponent } from '../pages/payment-list/payment-list.component';


@NgModule({
  declarations: [
    PaymentListComponent,
    PaymentCreateComponent,
    PaymentViewComponent,
    PaymentEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule { }
