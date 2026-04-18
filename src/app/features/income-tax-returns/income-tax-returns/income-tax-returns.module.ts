import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IncomeTaxReturnsRoutingModule } from './income-tax-returns-routing.module';
import { IncomeTaxReturnListComponent } from '../pages/income-tax-return-list/income-tax-return-list.component';
import { IncomeTaxReturnCreateComponent } from '../pages/income-tax-return-create/income-tax-return-create.component';
import { IncomeTaxReturnViewComponent } from '../pages/income-tax-return-view/income-tax-return-view.component';
import { IncomeTaxReturnEditComponent } from '../pages/income-tax-return-edit/income-tax-return-edit.component';
import { It10bComponent } from '../pages/IT10B/it10b.component';


@NgModule({
  declarations: [
    IncomeTaxReturnListComponent,
    IncomeTaxReturnCreateComponent,
    IncomeTaxReturnViewComponent,
    IncomeTaxReturnEditComponent,
    It10bComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IncomeTaxReturnsRoutingModule
  ]
})
export class IncomeTaxReturnsModule { }
