import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { AitRoutingModule } from './ait-routing.module';
import { AitListComponent }   from '../pages/ait-list/ait-list.component';
import { AitCreateComponent } from '../pages/ait-create/ait-create.component';

@NgModule({
  declarations: [
    AitListComponent, 
    AitCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule, 
    SharedModule, 
    AitRoutingModule]
})
export class AitModule { }