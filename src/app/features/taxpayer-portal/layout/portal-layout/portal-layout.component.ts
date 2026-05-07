import { Component } from '@angular/core';
import { AuthUser } from 'src/app/models/auth-user.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-portal-layout',
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.css']
})
export class PortalLayoutComponent {

  constructor(private authService: AuthService) {}

  get currentUser(): AuthUser | null {
    return this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
  }
}