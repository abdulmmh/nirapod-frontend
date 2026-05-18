import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(state);
  }

  canActivateChild(_childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(state);
  }

  private checkAccess(state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const userRole     = this.authService.userRole;
    const approvalStatus = this.authService.currentUser?.approvalStatus;

    if (userRole === Role.TAXPAYER) {

      // PENDING_REVIEW 
      if (approvalStatus === 'PENDING_REVIEW') {
        const allowed =
          state.url.startsWith('/my-portal/application-status') ||
          state.url.includes('/taxpayers/edit/')   ||
          state.url.includes('/my-portal/notices');

        if (!allowed) {
          this.router.navigate(['/my-portal/application-status']);
          return false;
        }
      }

      // REJECTED 
      if (approvalStatus === 'REJECTED') {
        const allowed =
          state.url.startsWith('/my-portal/application-status') ||
          state.url.includes('/taxpayers/edit/')       ||
          state.url.includes('/my-portal/notices');   

        if (!allowed) {
          this.router.navigate(['/my-portal/application-status']);
          return false;
        }
      }

      // APPROVED 
      if (approvalStatus === 'APPROVED') {
        if (!state.url.startsWith('/my-portal')) {
          this.router.navigate(['/my-portal']);
          return false;
        }
      }
    }

    const requiredRoles = this.collectRequiredRoles(state);
    if (requiredRoles.length > 0) {
      const hasRole =
        userRole === Role.SUPER_ADMIN ||
        requiredRoles.includes(userRole);

      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  private collectRequiredRoles(state: RouterStateSnapshot): Role[] {
    let current: ActivatedRouteSnapshot | null = state.root;
    let required: Role[] = [];
    while (current) {
      const roles = current.data['roles'] as Role[] | undefined;
      if (roles?.length) {
        required = roles;
      }
      current = current.firstChild;
    }
    return required;
  }
}
