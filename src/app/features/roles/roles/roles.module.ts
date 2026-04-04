import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { RolesRoutingModule } from './roles-routing.module';
import { RolesListComponent } from '../pages/roles-list/roles-list.component';
import { RolesCreateComponent } from '../pages/roles-create/roles-create.component';

@NgModule({
  declarations: [RolesListComponent, RolesCreateComponent],
  imports: [CommonModule, FormsModule, SharedModule, RolesRoutingModule]
})
export class RolesModule { }