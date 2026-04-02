import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesListComponent } from '../pages/roles-list/roles-list.component';

const routes: Routes = [
  { path: '',       component: RolesListComponent },
  { path: 'create', component: RolesListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }