import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TinRoutingModule } from './tin-routing.module';

import { TinListComponent } from '../pages/tin-list/tin-list.component';
import { TinCreateComponent } from '../pages/tin-create/tin-create.component';
import { TinEditComponent } from '../pages/tin-edit/tin-edit.component';
import { TinViewComponent } from '../pages/tin-view/tin-view.component';




@NgModule({
  declarations: [
    TinListComponent,
    TinCreateComponent,
    TinViewComponent,
    TinEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TinRoutingModule
  ]
})
export class TinModule { }
