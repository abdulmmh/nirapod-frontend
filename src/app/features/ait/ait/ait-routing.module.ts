import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { AitDashboardComponent } from '../pages/ait-dashboard/ait-dashboard.component';
import { AitCreateWizardComponent } from '../pages/ait-create-wizard/ait-create-wizard.component';
import { OfficerDashboardComponent } from '../pages/officer-dashboard/officer-dashboard.component';
import { OfficerReviewComponent } from '../pages/officer-review/officer-review.component';

const routes: Routes = [
  { path: '', component: AitDashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'create',
    component: AitCreateWizardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'officer-dashboard',
    component: OfficerDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['TAX_OFFICER', 'TAX_COMMISSIONER'] },
  },
  {
    path: 'review/:id',
    component: OfficerReviewComponent,
    canActivate: [AuthGuard],
    data: { roles: ['TAX_OFFICER', 'TAX_COMMISSIONER'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AitRoutingModule {}
