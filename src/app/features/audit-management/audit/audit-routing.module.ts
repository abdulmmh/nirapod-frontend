import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';

import { AuditListComponent } from '../pages/audit-list/audit-list.component';
import { AuditCreateComponent } from '../pages/audit-create/audit-create.component';
import { AuditDetailComponent } from '../pages/audit-view/audit-view.component';
import { AssessmentReviewComponent } from '../pages/assessment-review/assessment-review.component';
import { Role } from 'src/app/core/constants/roles.constants';

export const AUDIT_ROUTES: Routes = [
  // ── Officer Routes ──────────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: AuditListComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [
            Role.TAX_OFFICER,
            Role.SUPER_ADMIN,
            Role.TAX_COMMISSIONER,
            Role.AUDITOR,
          ],
          title: 'Audit Cases',
        },
      },
      {
        path: 'create',
        component: AuditCreateComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [
            Role.TAX_OFFICER,
            Role.SUPER_ADMIN,
            Role.TAX_COMMISSIONER,
            Role.AUDITOR,
          ],
          title: 'New Audit Case',
        },
      },
      {
        path: ':id',
        component: AuditDetailComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [
            Role.TAX_OFFICER,
            Role.SUPER_ADMIN,
            Role.TAX_COMMISSIONER,
            Role.AUDITOR,
          ],
          title: 'Audit Case Details',
        },
      },
      {
        path: ':id/edit',
        component: AuditCreateComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [
            Role.TAX_OFFICER,
            Role.SUPER_ADMIN,
            Role.TAX_COMMISSIONER,
            Role.AUDITOR,
          ],
          title: 'Edit Audit Case',
        },
      },
      {
        path: ':id/propose-assessment',
        component: AssessmentReviewComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.AUDITOR],
          title: 'Propose Assessment',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(AUDIT_ROUTES)],
  exports: [RouterModule],
})
export class AuditRoutingModule {}
