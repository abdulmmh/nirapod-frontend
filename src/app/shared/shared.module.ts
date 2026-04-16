import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasRoleDirective, CanDoDirective } from '../core/directives/has-role.directive';
import { ToastComponent } from './toast/toast.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HasRoleDirective,
    CanDoDirective,
    ToastComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
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