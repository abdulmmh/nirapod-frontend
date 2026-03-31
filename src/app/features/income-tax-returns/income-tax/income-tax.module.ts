import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IncomeTaxRoutingModule } from './income-tax-routing.module';

import { IncomeTaxListComponent } from '../pages/income-tax-list/income-tax-list.component';
import { IncomeTaxCreateComponent } from '../pages/income-tax-create/income-tax-create.component';
import { IncomeTaxViewComponent } from '../pages/income-tax-view/income-tax-view.component';
import { IncomeTaxEditComponent } from '../pages/income-tax-edit/income-tax-edit.component';


@NgModule({
  declarations: [
    IncomeTaxListComponent,
    IncomeTaxCreateComponent,
    IncomeTaxViewComponent,
    IncomeTaxEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IncomeTaxRoutingModule
  ]
})
export class IncomeTaxModule { }
