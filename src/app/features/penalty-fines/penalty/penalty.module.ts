import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PenaltyRoutingModule } from './penalty-routing.module';

import { PenaltyListComponent } from '../pages/penalty-list/penalty-list.component';
import { PenaltyCreateComponent } from '../pages/penalty-create/penalty-create.component';
import { PenaltyViewComponent } from '../pages/penalty-view/penalty-view.component';
import { PenaltyEditComponent } from '../pages/penalty-edit/penalty-edit.component';



@NgModule({
  declarations: [
    PenaltyListComponent,
    PenaltyCreateComponent,
    PenaltyViewComponent,
    PenaltyEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,  
    PenaltyRoutingModule
  ]
})
export class PenaltyModule { }
