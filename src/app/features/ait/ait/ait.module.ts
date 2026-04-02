import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { AitRoutingModule } from './ait-routing.module';
import { AitListComponent }   from '../pages/ait-list/ait-list.component';
import { AitCreateComponent } from '../pages/ait-create/ait-create.component';
import { AitEditComponent } from '../pages/ait-edit/ait-edit.component';

@NgModule({
  declarations: [
    AitListComponent, 
    AitCreateComponent,
    AitEditComponent,
    AitEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule, 
    SharedModule, 
    AitRoutingModule]
})
export class AitModule { }