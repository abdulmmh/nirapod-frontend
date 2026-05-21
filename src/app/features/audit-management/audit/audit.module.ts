import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';  
import { AuditRoutingModule } from './audit-routing.module';

import { AuditListComponent } from '../pages/audit-list/audit-list.component';
import { AuditCreateComponent } from '../pages/audit-create/audit-create.component';
import { AuditDetailComponent } from '../pages/audit-view/audit-view.component';
import { AssessmentReviewComponent } from '../pages/assessment-review/assessment-review.component';
import { AuditEditComponent } from '../pages/audit-edit/audit-edit.component';

@NgModule({
  declarations: [
    AuditListComponent,
    AuditCreateComponent,
    AuditEditComponent,
    AuditDetailComponent,
    AssessmentReviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,         
    AuditRoutingModule,
  ]
})
export class AuditModule {}