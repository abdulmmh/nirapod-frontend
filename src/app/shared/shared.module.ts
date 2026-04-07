import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasRoleDirective, CanDoDirective } from '../core/directives/has-role.directive';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [
    HasRoleDirective,
    CanDoDirective,
    ToastComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    HasRoleDirective,
    CanDoDirective,
    ToastComponent
  ]
})
export class SharedModule { }