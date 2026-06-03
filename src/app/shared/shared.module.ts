import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasRoleDirective, CanDoDirective } from '../core/directives/has-role.directive';
import { ToastComponent } from './toast/toast.component';
import { TaxpayerSearchComponent } from './taxpayer-search/taxpayer-search.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HasRoleDirective,
    CanDoDirective,
    ToastComponent,
    TaxpayerSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    HasRoleDirective,
    CanDoDirective,
    ToastComponent,
    TaxpayerSearchComponent
  ]
})
export class SharedModule { }