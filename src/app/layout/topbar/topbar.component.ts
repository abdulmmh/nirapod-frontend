import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { NoticeService } from 'src/app/features/notices-notifications/services/notice.service';
import { NotificationService } from 'src/app/features/notices-notifications/services/notification.service';
import { Notice } from 'src/app/models/notice.model';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  @ViewChild('mobileSearchInput') mobileSearchInput!: any;
  private destroy$ = new Subject<void>();

  isUserDropdownOpen = false;
  isNotifDropdownOpen = false;
  isSearchOpen = false;
  currentDate: string = '';
  notices: Notice[] = [];
  isLoadingNotices = false;

  unreadCount = 0;

  get recentNotices(): Notice[] {
    return [...this.notices]
      .sort(
        (a, b) =>
          new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime(),
      )
      .slice(0, this.recentNoticeLimit);
  }

  private readonly recentNoticeLimit = 5;

  // get unreadCount(): number {
  //   return this.notices.filter(n => n.status === 'Unread').length;
  // }

  constructor(
    private eRef: ElementRef,
    private authService: AuthService,
    private noticeService: NoticeService,
    private notificationSvc: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.notificationSvc.startPolling();

    this.notificationSvc.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => (this.unreadCount = count));

    // this.loadNotices();
  }

  loadNotices(): void {
    this.isLoadingNotices = true;
    this.notificationSvc
      .getMyNotices() // গ্লোবাল সার্ভিস থেকে নোটিফিকেশন ডাটা ফেচ
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.notices = data ?? [];
          this.isLoadingNotices = false;
        },
        error: () => {
          this.notices = [];
          this.isLoadingNotices = false;
        },
      });
  }

  getNoticeIcon(type: string): string {
    return this.noticeService.getTypeIcon(type);
  }

  getNoticeTime(issuedDate: string): string {
    return this.noticeService.formatRelativeTime(issuedDate);
  }

  viewNotice(notice: Notice, event: Event): void {
    event.stopPropagation();
    this.isNotifDropdownOpen = false;

    // নোটিফিকেশনটি যদি Unread থাকে, তবে ব্যাকএন্ডে Read স্ট্যাটাস আপডেট পাঠান
    if (notice.status === 'Unread') {
      this.notificationSvc.markAsRead(notice.id).subscribe({
        next: () => {
          notice.status = 'Read';
          this.notificationSvc.refresh(); // কাউন্টার ম্যানুয়ালি রিফ্রেশ
        },
      });
    }

    this.router.navigate(['/notices/view', notice.id]);
  }

  viewAllNotices(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isNotifDropdownOpen = false;
    this.router.navigate(['/notices']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSearch(): void {
    this.isSearchOpen = true;
    timer(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.mobileSearchInput?.nativeElement?.focus());
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
    if (this.isNotifDropdownOpen) {
      this.loadNotices();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserDropdownOpen = false;
      this.isNotifDropdownOpen = false;
    }
  }

  get currentUser() {
    return this.authService.currentUser;
  }
  get userInitial() {
    return this.authService.currentUser?.fullName?.charAt(0) ?? 'A';
  }

  logout(): void {
    this.notificationSvc.stopPolling();
    this.authService.logout();
  }
}
