import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasRoleDirective, CanDoDirective } from '../core/directives/has-role.directive';

@NgModule({
  declarations: [
    HasRoleDirective,
    CanDoDirective
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    HasRoleDirective,
    CanDoDirective
  ]
})
export class SharedModule { }