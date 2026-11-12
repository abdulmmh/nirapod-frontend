import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Notice } from '../../../../models/notice.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import { NoticeService } from '../../services/notice.service';

@Component({
  selector: 'app-notice-list',
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.css'],
})
export class NoticeListComponent implements OnInit {
  notices: Notice[] = [];
  searchTerm = '';
  isLoading = false;
  activeFilter = 'All';
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  filters = ['All', 'Unread', 'Read', 'Responded', 'Urgent', 'Expired'];

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  Role = Role;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private toast: ToastService,
    private noticeService: NoticeService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.noticeService.getMyNotices().subscribe({
        next: (data) => {
            this.notices = data;
            this.isLoading = false;
        },
        error: () => {
            this.notices = [];
            this.isLoading = false;
            this.toast.error('Failed to load notices. Please retry.');
        },
    });
  }

  get filteredNotices(): Notice[] {
    let result = this.notices;

    // Filter by tab
    if (this.activeFilter !== 'All') {
      if (this.activeFilter === 'Urgent') {
        result = result.filter((n) => n.priority === 'Urgent');
      } else {
        result = result.filter((n) => n.status === this.activeFilter);
      }
    }

    // Filter by search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (n) =>
          n.noticeNo.toLowerCase().includes(term) ||
          n.subject.toLowerCase().includes(term) ||
          n.taxpayerName.toLowerCase().includes(term) ||
          n.noticeType.toLowerCase().includes(term),
      );
    }

    return result;
  }

  get unreadCount(): number {
    return this.notices.filter((n) => n.status === 'Unread').length;
  }

  // ── KPI Summary Cards — replaces the old filter-tabs row ────────────────────

  get kpiUnread(): number {
    return this.notices.filter((n) => n.status === 'Unread').length;
  }

  get kpiResponded(): number {
    return this.notices.filter((n) => n.status === 'Responded').length;
  }

  get kpiUrgent(): number {
    return this.notices.filter((n) => n.priority === 'Urgent').length;
  }

  get kpiExpired(): number {
    return this.notices.filter((n) => n.status === 'Expired').length;
  }

  /** Called when a clickable KPI card is clicked — toggles filter, same semantics as the old tabs. */
  onKpiCardClick(filter: string): void {
    this.activeFilter = this.activeFilter === filter ? 'All' : filter;
    this.currentPage = 1;
  }

  isKpiActive(filter: string): boolean {
    return this.activeFilter === filter;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredNotices.length / this.pageSize));
  }

  get paginatedNotices(): Notice[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNotices.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filteredNotices.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredNotices.length);
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Unread: 'status-unread',
      Read: 'status-read',
      Responded: 'status-active',
      Expired: 'status-inactive',
      Cancelled: 'status-suspended',
    };
    return map[status] ?? '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'pri-low',
      Normal: 'pri-normal',
      High: 'pri-high',
      Urgent: 'pri-urgent',
    };
    return map[priority] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      General: 'bi bi-info-circle-fill',
      'Tax Due': 'bi bi-cash-coin',
      'Audit Notice': 'bi bi-shield-fill-check',
      'Penalty Notice': 'bi bi-exclamation-triangle-fill',
      Compliance: 'bi bi-patch-check-fill',
      'Refund Update': 'bi bi-cash-stack',
      System: 'bi bi-gear-fill',
      Reminder: 'bi bi-bell-fill',
    };
    return map[type] ?? 'bi bi-bell-fill';
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      General: 'type-general',
      'Tax Due': 'type-taxdue',
      'Audit Notice': 'type-audit',
      'Penalty Notice': 'type-penalty',
      Compliance: 'type-compliance',
      'Refund Update': 'type-refund',
      System: 'type-system',
      Reminder: 'type-reminder',
    };
    return map[type] ?? '';
  }

  viewNotice(id: number): void {
   this.router.navigate(['view', id], {
      relativeTo: this.route
    });
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.noticeService.delete(id).subscribe({
      next: () => {
        this.notices = this.notices.filter((n) => n.id !== id);
        this.toast.success('Notice deleted successfully.');
      },
      error: () => {
        this.toast.error('Failed to delete notice. Please try again.');
      },
    });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}