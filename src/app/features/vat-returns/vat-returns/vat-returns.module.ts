import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { VatReturnsRoutingModule } from './vat-returns-routing.module';

import { VatReturnListComponent } from '../pages/vat-return-list/vat-return-list.component';
import { VatReturnEditComponent } from '../pages/vat-return-edit/vat-return-edit.component';
import { VatReturnViewComponent } from '../pages/vat-return-view/vat-return-view.component';
import { VatReturnCreateComponent } from '../pages/vat-return-create/vat-return-create.component';


@NgModule({
  declarations: [
    VatReturnListComponent,
    VatReturnCreateComponent,
    VatReturnViewComponent,
    VatReturnEditComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    VatReturnsRoutingModule
  ]
})
export class VatReturnsModule { }
