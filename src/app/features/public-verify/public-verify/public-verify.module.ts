import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PublicVerifyRoutingModule } from './public-verify-routing.module';
import { VerifyPageComponent } from '../pages/verify-page/verify-page.component';

@NgModule({
  declarations: [VerifyPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    PublicVerifyRoutingModule
  ]
})
export class PublicVerifyModule {}
