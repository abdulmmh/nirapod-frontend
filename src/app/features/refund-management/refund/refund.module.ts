import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RefundRoutingModule } from './refund-routing.module';
import { RefundListComponent } from '../pages/refund-list/refund-list.component';
import { RefundCreateComponent } from '../pages/refund-create/refund-create.component';
import { RefundViewComponent } from '../pages/refund-view/refund-view.component';
import { RefundEditComponent } from '../pages/refund-edit/refund-edit.component';
import { RefundSuccessComponent } from '../pages/refund-success/refund-success.component';
import { RefundRespondComponent } from '../pages/refund-respond/refund-respond.component';
import { RefundStatusBadgeComponent } from '../components/refund-status-badge/refund-status-badge.component';
import { RefundStatusTimelineComponent } from '../components/refund-status-timeline/refund-status-timeline.component';

@NgModule({
  declarations: [
    RefundListComponent,
    RefundCreateComponent,
    RefundViewComponent,
    RefundEditComponent,
    RefundSuccessComponent,
    RefundRespondComponent,
    RefundStatusBadgeComponent,
    RefundStatusTimelineComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RefundRoutingModule,
  ],
  exports: [
    RefundStatusBadgeComponent,
    RefundStatusTimelineComponent,
  ],
})
export class RefundModule {}
