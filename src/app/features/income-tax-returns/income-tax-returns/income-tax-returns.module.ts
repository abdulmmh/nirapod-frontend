import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IncomeTaxReturnsRoutingModule } from './income-tax-returns-routing.module';
import { IncomeTaxReturnListComponent } from '../pages/income-tax-return-list/income-tax-return-list.component';
import { IncomeTaxReturnCreateComponent } from '../pages/income-tax-return-create/income-tax-return-create.component';
import { IncomeTaxReturnViewComponent } from '../pages/income-tax-return-view/income-tax-return-view.component';
import { IncomeTaxReturnEditComponent } from '../pages/income-tax-return-edit/income-tax-return-edit.component';


@NgModule({
  declarations: [
    IncomeTaxReturnListComponent,
    IncomeTaxReturnCreateComponent,
    IncomeTaxReturnViewComponent,
    IncomeTaxReturnEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IncomeTaxReturnsRoutingModule
  ]
})
export class IncomeTaxReturnsModule { }
