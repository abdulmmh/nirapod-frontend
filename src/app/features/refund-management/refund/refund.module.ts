import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

import { RefundRoutingModule } from './refund-routing.module';
import { RefundListComponent } from '../pages/refund-list/refund-list.component';
import { RefundCreateComponent } from '../pages/refund-create/refund-create.component';
import { RefundViewComponent } from '../pages/refund-view/refund-view.component';
import { RefundEditComponent } from '../pages/refund-edit/refund-edit.component';



@NgModule({
  declarations: [
    RefundListComponent,
    RefundCreateComponent,
    RefundViewComponent,
    RefundEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RefundRoutingModule
  ]
})
export class RefundModule { }
