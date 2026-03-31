import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoticeRoutingModule } from './notice-routing.module';

import { NoticeListComponent }   from '../pages/notice-list/notice-list.component';
import { NoticeCreateComponent } from '../pages/notice-create/notice-create.component';
import { NoticeViewComponent }   from '../pages/notice-view/notice-view.component';



@NgModule({
  declarations: [
    NoticeListComponent,
    NoticeCreateComponent,
    NoticeViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NoticeRoutingModule
  ]
})
export class NoticeModule { }