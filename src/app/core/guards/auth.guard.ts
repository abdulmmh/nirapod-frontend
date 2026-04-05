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

    const requiredRoles = this.collectRequiredRoles(state);
    if (requiredRoles.length > 0) {
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

  /**
   * Reads `data.roles` only from route snapshots on the **current navigation’s
   * activation path** (`state.root` → `firstChild` → … → leaf).
   *
   * Do not walk `firstChild`/`parent` from an arbitrary `ActivatedRouteSnapshot`
   * passed to the guard: that can pick up the wrong branch and apply another
   * sibling segment’s role rules to unrelated routes.
   *
   * If several segments define `data.roles`, the **deepest** (most specific)
   * non-empty array wins.
   */
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
