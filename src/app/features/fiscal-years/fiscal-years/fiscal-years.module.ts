import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { FiscalYearsRoutingModule } from './fiscal-years-routing.module';
import { FiscalYearListComponent }   from '../pages/fiscal-year-list/fiscal-year-list.component';
import { FiscalYearCreateComponent } from '../pages/fiscal-year-create/fiscal-year-create.component';
import { FiscalYearEditComponent } from '../pages/fiscal-year-edit/fiscal-year-edit.component';

@NgModule({
  declarations: [
    FiscalYearListComponent, 
    FiscalYearCreateComponent,
    FiscalYearEditComponent
  ],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule, 
    FiscalYearsRoutingModule
  ]
})
export class FiscalYearsModule { }