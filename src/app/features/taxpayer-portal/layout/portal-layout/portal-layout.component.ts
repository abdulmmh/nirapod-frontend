import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthUser } from 'src/app/models/auth-user.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-portal-layout',
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.css']
})
export class PortalLayoutComponent {

  showDropdown = false;
  currentYear = new Date().getFullYear();
  currentPageTitle = '';

  @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.showDropdown = false;
      }
    }
  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPageTitle = this.getPageTitle(this.router.url);
    });
  }

  private getPageTitle(url: string): string {
    if (url === '/my-portal') return '';
    if (url.includes('/tin')) return 'TIN Management';
    if (url.includes('/itr')) return 'Income Tax Returns';
    if (url.includes('/payments')) return 'Payments';
    if (url.includes('/notices')) return 'Notices';
    if (url.includes('/vat-returns')) return 'VAT Returns';
    if (url.includes('/vat-registration')) return 'VAT Registration';
    if (url.includes('/documents')) return 'Documents';
    if (url.includes('/ait')) return 'AIT';
    return '';
  }

  get currentUser(): AuthUser | null {
    return this.authService.currentUser;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.showDropdown = false;
    this.authService.logout();
  }
}