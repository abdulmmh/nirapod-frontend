import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { BusinessRoutingModule } from './business-routing.module';

import { BusinessListComponent } from '../pages/business-list/business-list.component';
import { BusinessCreateComponent } from '../pages/business-create/business-create.component';
import { BusinessViewComponent } from '../pages/business-view/business-view.component';
import { BusinessEditComponent } from '../pages/business-edit/business-edit.component';



@NgModule({
  declarations: [
    BusinessListComponent,
    BusinessCreateComponent,
    BusinessViewComponent,
    BusinessEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BusinessRoutingModule,

  ]
})
export class BusinessModule { }
