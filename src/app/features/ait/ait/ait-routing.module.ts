import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { AitDashboardComponent } from '../pages/ait-dashboard/ait-dashboard.component';
import { AitCreateWizardComponent } from '../pages/ait-create-wizard/ait-create-wizard.component';
import { OfficerDashboardComponent } from '../pages/officer-dashboard/officer-dashboard.component';
import { OfficerReviewComponent } from '../pages/officer-review/officer-review.component';
import { AitCreditLedgerComponent } from '../pages/ait-credit-ledger/ait-credit-ledger.component';

const routes: Routes = [
  {
    path: '',
    component: AitDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.TAXPAYER,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
        Role.DATA_ENTRY_OPERATOR,
        Role.SUPER_ADMIN,
      ],
    },
  },
  {
    path: 'create',
    component: AitCreateWizardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.TAXPAYER,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.DATA_ENTRY_OPERATOR,
        Role.SUPER_ADMIN,
      ],
    },
  },
  {
    path: 'officer-dashboard',
    component: OfficerDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.SUPER_ADMIN],
    },
  },
  {
    path: 'review/:id',
    component: OfficerReviewComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.SUPER_ADMIN, Role.TAXPAYER],
    },
  },
  {
    path: 'credits',
    component: AitCreditLedgerComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.TAXPAYER,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.SUPER_ADMIN,
      ],
    },
  },
  {
    path: ':id',
    component: OfficerReviewComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.TAXPAYER,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
        Role.DATA_ENTRY_OPERATOR,
        Role.SUPER_ADMIN,
      ],
    },
  },
  {
    path: ':id/edit',
    component: AitCreateWizardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.TAXPAYER,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.DATA_ENTRY_OPERATOR,
        Role.SUPER_ADMIN,
      ],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AitRoutingModule {}
