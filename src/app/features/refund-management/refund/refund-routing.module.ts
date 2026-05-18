import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefundListComponent } from '../pages/refund-list/refund-list.component';
import { RefundCreateComponent } from '../pages/refund-create/refund-create.component';
import { RefundViewComponent } from '../pages/refund-view/refund-view.component';
import { RefundEditComponent } from '../pages/refund-edit/refund-edit.component';
import { RefundSuccessComponent } from '../pages/refund-success/refund-success.component';
import { RefundRespondComponent } from '../pages/refund-respond/refund-respond.component';

const routes: Routes = [
  { path: '', component: RefundListComponent },
  { path: 'create', component: RefundCreateComponent },
  { path: 'success/:id', component: RefundSuccessComponent },
  { path: ':id/view', component: RefundViewComponent },
  { path: ':id/edit', component: RefundEditComponent },
  { path: ':id/respond', component: RefundRespondComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundRoutingModule {}
