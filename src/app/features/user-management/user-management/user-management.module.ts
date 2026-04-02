import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserListComponent }   from '../pages/user-list/user-list.component';
import { UserCreateComponent } from '../pages/user-create/user-create.component';
import { UserViewComponent }   from '../pages/user-view/user-view.component';
import { UserEditComponent }   from '../pages/user-edit/user-edit.component';

@NgModule({
  declarations: [UserListComponent, UserCreateComponent, UserViewComponent, UserEditComponent],
  imports: [CommonModule, FormsModule, SharedModule, UserManagementRoutingModule]
})
export class UserManagementModule { }