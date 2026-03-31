import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { DocumentVerificationRoutingModule } from './document-verification-routing.module';

import { DocumentListComponent }   from '../pages/document-list/document-list.component';
import { DocumentCreateComponent } from '../pages/document-create/document-create.component';
import { DocumentViewComponent }   from '../pages/document-view/document-view.component';
import { DocumentEditComponent }   from '../pages/document-edit/document-edit.component';

@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentCreateComponent,
    DocumentViewComponent,
    DocumentEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DocumentVerificationRoutingModule
  ]
})
export class DocumentVerificationModule { }