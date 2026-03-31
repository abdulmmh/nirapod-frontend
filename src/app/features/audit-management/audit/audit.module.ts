import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AuditRoutingModule } from './audit-routing.module';

import { AuditListComponent }   from '../pages/audit-list/audit-list.component';
import { AuditCreateComponent } from '../pages/audit-create/audit-create.component';
import { AuditViewComponent }   from '../pages/audit-view/audit-view.component';
import { AuditEditComponent }   from '../pages/audit-edit/audit-edit.component';

@NgModule({
  declarations: [
    AuditListComponent,
    AuditCreateComponent,
    AuditViewComponent,
    AuditEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AuditRoutingModule
  ]
})
export class AuditModule { }