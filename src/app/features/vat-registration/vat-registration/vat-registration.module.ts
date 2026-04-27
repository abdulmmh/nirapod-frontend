import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { VatRegistrationRoutingModule } from './vat-registration-routing.module';

import { VatRegistrationListComponent } from '../pages/vat-registration-list/vat-registration-list.component';
import { VatRegistrationCreateComponent } from '../pages/vat-registration-create/vat-registration-create.component';
import { VatRegistrationViewComponent } from '../pages/vat-registration-view/vat-registration-view.component';
import { VatRegistrationEditComponent } from '../pages/vat-registration-edit/vat-registration-edit.component';
import { TaxpayerSearchComponent } from '../components/taxpayer-search/taxpayer-search.component';
import { BusinessPickerComponent } from '../components/business-picker/business-picker.component';


@NgModule({
  declarations: [
    VatRegistrationListComponent,
    VatRegistrationCreateComponent,
    VatRegistrationViewComponent,
    VatRegistrationEditComponent,

    // Child components 
    TaxpayerSearchComponent,
    BusinessPickerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    VatRegistrationRoutingModule
  ]
})
export class VatRegistrationModule { }
