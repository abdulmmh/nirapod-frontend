import {
  Directive, Input, TemplateRef,
  ViewContainerRef, OnInit
} from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[hasRole]' })
export class HasRoleDirective implements OnInit {
  @Input() hasRole: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.userRole;
    const allowed  = this.hasRole.includes(userRole);
    if (allowed || this.authService.userRole === 'SUPER_ADMIN') {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

@Directive({ selector: '[canDo]' })
export class CanDoDirective implements OnInit {
  @Input() canDo: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.canDo(this.canDo)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}