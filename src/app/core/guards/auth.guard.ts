import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role, ROLE_PERMISSIONS } from '../constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    // Not logged in → redirect to login
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Check required roles from route data
    const requiredRoles: Role[] = route.data['roles'];
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.authService.userRole;
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
}