import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaxpayerRoutingModule } from './taxpayer-routing.module';

import { TaxpayerListComponent } from '../pages/taxpayer-list/taxpayer-list.component';
import { TaxpayerCreateComponent } from '../pages/taxpayer-create/taxpayer-create.component';
import { TaxpayerEditComponent } from '../pages/taxpayer-edit/taxpayer-edit.component';
import { TaxpayerViewComponent } from '../pages/taxpayer-view/taxpayer-view.component';



@NgModule({
  declarations: [
    TaxpayerListComponent,
    TaxpayerCreateComponent,  
    TaxpayerViewComponent,
    TaxpayerEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TaxpayerRoutingModule
  ]
})
export class TaxpayerModule { }
