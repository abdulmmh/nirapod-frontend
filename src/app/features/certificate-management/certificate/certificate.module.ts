// certificate.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

import { CertificateRoutingModule } from './certificate-routing.module';
import { CertificateListComponent } from '../pages/certificate-list/certificate-list.component';
import { CertificateViewComponent } from '../pages/certificate-view/certificate-view.component';

@NgModule({
  declarations: [
    CertificateListComponent,
    CertificateViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CertificateRoutingModule
  ]
})
export class CertificateModule {}
