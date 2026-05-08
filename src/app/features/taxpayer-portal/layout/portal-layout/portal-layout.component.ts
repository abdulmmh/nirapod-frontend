import { Component } from '@angular/core';
import { AuthUser } from 'src/app/models/auth-user.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-portal-layout',
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.css']
})
export class PortalLayoutComponent {
  showDropdown = false;


  constructor(private authService: AuthService) {}

  get currentUser(): AuthUser | null {
    return this.authService.currentUser;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.authService.logout();
  }
}