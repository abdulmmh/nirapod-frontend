import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { DocumentListComponent } from '../pages/document-list/document-list.component';
import { DocumentCreateComponent } from '../pages/document-create/document-create.component';
import { DocumentEditComponent } from '../pages/document-edit/document-edit.component';
import { DocumentViewComponent } from '../pages/document-view/document-view.component';



const routes: Routes = [
  {
    path: '',
    component: DocumentListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
  },
  {
    path: 'create',
    component: DocumentCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR] }
  },
  {
    path: ':id',
    component: DocumentViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.DATA_ENTRY_OPERATOR] }
  },
  {
    path: ':id/edit',
    component: DocumentEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentVerificationRoutingModule { }