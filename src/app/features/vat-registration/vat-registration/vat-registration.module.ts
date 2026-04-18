import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { VatRegistrationRoutingModule } from './vat-registration-routing.module';

import { VatRegistrationListComponent } from '../pages/vat-registration-list/vat-registration-list.component';
import { VatRegistrationCreateComponent } from '../pages/vat-registration-create/vat-registration-create.component';
import { VatRegistrationViewComponent } from '../pages/vat-registration-view/vat-registration-view.component';
import { VatRegistrationEditComponent } from '../pages/vat-registration-edit/vat-registration-edit.component';


@NgModule({
  declarations: [
    VatRegistrationListComponent,
    VatRegistrationCreateComponent,
    VatRegistrationViewComponent,
    VatRegistrationEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    VatRegistrationRoutingModule
  ]
})
export class VatRegistrationModule { }
