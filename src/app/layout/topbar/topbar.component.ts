import {
  Component, EventEmitter, OnInit, Output,
  HostListener, ElementRef, ViewChild
} from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  @ViewChild('mobileSearchInput') mobileSearchInput!: any;

  isUserDropdownOpen = false;
  isNotifDropdownOpen = false;
  isSearchOpen = false;
  currentDate: string = '';

  notifications = [
    { icon: 'bi bi-file-earmark-text', text: 'New VAT Return submitted',    time: '5 min ago',  unread: true  },
    { icon: 'bi bi-person-plus',        text: 'New taxpayer registered',      time: '1 hr ago',   unread: true  },
    { icon: 'bi bi-exclamation-triangle',text: 'Penalty issued to TIN #44821',time: '3 hr ago',   unread: false },
    { icon: 'bi bi-shield-check',        text: 'Audit #A-2024-009 completed', time: 'Yesterday',  unread: false },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  constructor(private eRef: ElementRef, private authService: AuthService) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  openSearch(): void {
    this.isSearchOpen = true;
    setTimeout(() => this.mobileSearchInput?.nativeElement?.focus(), 100);
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isNotifDropdownOpen = false;
  }

  toggleNotifDropdown(): void {
    this.isNotifDropdownOpen = !this.isNotifDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserDropdownOpen = false;
      this.isNotifDropdownOpen = false;
    }
  }

  get currentUser() { return this.authService.currentUser; }
  get userInitial()  { return this.authService.currentUser?.fullName?.charAt(0) ?? 'A'; }

  logout(): void { this.authService.logout(); }
}