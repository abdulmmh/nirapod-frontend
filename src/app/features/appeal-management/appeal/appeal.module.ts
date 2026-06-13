import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

import { AppealRoutingModule }  from './appeal-routing.module';
import { AppealListComponent }  from '../pages/appeal-list/appeal-list.component';
import { AppealViewComponent }  from '../pages/appeal-view/appeal-view.component';

@NgModule({
  declarations: [
    AppealListComponent,
    AppealViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AppealRoutingModule,
  ]
})
export class AppealModule {}
