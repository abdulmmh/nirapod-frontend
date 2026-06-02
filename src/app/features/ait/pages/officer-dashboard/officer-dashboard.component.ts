import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AitService } from '../../services/ait.service';
import { AitRecord, AitStatus } from '../../models/ait.model';
import { AuthService } from '../../../../core/services/auth.service';
import { forkJoin, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-officer-dashboard',
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css'],
})
export class OfficerDashboardComponent implements OnInit {
  Math = Math;

  allRecords: AitRecord[] = [];
  filteredRecords: AitRecord[] = [];

  private destroy$ = new Subject<void>();

  kpis = {
    myQueue: 0,
    reviewedToday: 0,
    approvedWeek: 0,
    slaRiskPercent: 0,
  };

  // Filters
  activeTab: AitStatus | 'ALL' = 'ALL';
  searchQuery: string = '';
  dateFilterFrom: string = '';
  dateFilterTo: string = '';
  sortBy: 'date' | 'amount' | 'ref_no' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Bulk selection
  selectedIds: Set<number> = new Set();

  statusOptions: AitStatus[] = [
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
  ];
  isLoading: boolean = true;
  loadError: string | null = null;

  // ── SLA Config: 48 hrs from creation to review deadline ──
  private readonly SLA_HOURS = 48;

  constructor(
    private aitService: AitService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadQueueData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get officerName(): string {
    return this.authService.currentUser?.fullName ?? 'Officer';
  }

  get approvalRate(): number {
    const total = this.allRecords.filter(
      (r) => r.status === 'APPROVED' || r.status === 'REJECTED',
    ).length;
    if (total === 0) return 0;
    const approved = this.allRecords.filter(
      (r) => r.status === 'APPROVED',
    ).length;
    return Math.round((approved / total) * 100);
  }

  loadQueueData(): void {
    this.isLoading = true;
    this.loadError = null;

    forkJoin({
      pending: this.aitService.getPendingQueue(),
      myQueue: this.aitService.getMyQueue(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ pending, myQueue }) => {
          const allIds = new Set<number>();
          const merged: AitRecord[] = [];
          [...pending, ...myQueue].forEach((r) => {
            if (r.id && !allIds.has(r.id)) {
              allIds.add(r.id);
              merged.push(r);
            }
          });
          this.allRecords = merged;
          this.calculateKPIs();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.loadError = 'Failed to load queue data. Please try again.';
          this.isLoading = false;
        },
      });
  }

  calculateKPIs(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.kpis.myQueue = this.allRecords.filter(
      (r) => r.status === 'UNDER_REVIEW',
    ).length;

    this.kpis.reviewedToday = this.allRecords.filter((r) => {
      const updated = new Date(r.updatedAt || '');
      updated.setHours(0, 0, 0, 0);
      return updated.getTime() === today.getTime();
    }).length;

    this.kpis.approvedWeek = this.allRecords.filter((r) => {
      const updated = new Date(r.updatedAt || '');
      return updated >= weekAgo && r.status === 'APPROVED';
    }).length;

    const overdue = this.allRecords.filter(
      (r) => this.getSlaHours(r) < 0,
    ).length;
    this.kpis.slaRiskPercent =
      this.allRecords.length > 0
        ? Math.round((overdue / this.allRecords.length) * 100)
        : 0;
  }

  applyFilters(): void {
    let filtered = [...this.allRecords];

    if (this.activeTab !== 'ALL') {
      filtered = filtered.filter((r) => r.status === this.activeTab);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.aitReferenceNo?.toLowerCase().includes(q) ||
          r.taxpayerName?.toLowerCase().includes(q) ||
          r.aitReferenceNo?.toLowerCase().includes(q),
      );
    }

    if (this.dateFilterFrom) {
      const fromDate = new Date(this.dateFilterFrom);
      filtered = filtered.filter(
        (r) => new Date(r.createdAt || '') >= fromDate,
      );
    }
    if (this.dateFilterTo) {
      const toDate = new Date(this.dateFilterTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt || '') <= toDate);
    }

    // SLA filter
    if (this.slaFilter === 'overdue') {
      filtered = filtered.filter((r) => this.getSlaHours(r) < 0);
    } else if (this.slaFilter === 'at_risk') {
      filtered = filtered.filter((r) => {
        const h = this.getSlaHours(r);
        return h >= 0 && h < 12;
      });
    }

    filtered.sort((a, b) => {
      let cA: any, cB: any;
      switch (this.sortBy) {
        case 'date':
          cA = new Date(a.createdAt || '').getTime();
          cB = new Date(b.createdAt || '').getTime();
          break;
        case 'amount':
          cA = a.calculatedAitAmount;
          cB = b.calculatedAitAmount;
          break;
        case 'ref_no':
          cA = a.aitReferenceNo || '';
          cB = b.aitReferenceNo || '';
          break;
      }
      if (cA < cB) return this.sortOrder === 'asc' ? -1 : 1;
      if (cA > cB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredRecords = filtered;
    this.currentPage = 1;
  }

  setActiveTab(tab: AitStatus | 'ALL'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }
  onDateChange(): void {
    this.applyFilters();
  }

  setSortBy(field: 'date' | 'amount' | 'ref_no'): void {
    this.sortBy =
      this.sortBy === field && this.sortOrder === 'desc' ? field : field;
    this.sortOrder =
      this.sortBy === field && this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.applyFilters();
  }

  // ── Pagination ────────────────────────────────────────
  getPaginatedRecords(): AitRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(total, 5); i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) this.currentPage++;
  }
  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ── Bulk Select ───────────────────────────────────────
  toggleSelect(id: number): void {
    this.selectedIds.has(id)
      ? this.selectedIds.delete(id)
      : this.selectedIds.add(id);
  }

  isAllSelected(): boolean {
    const page = this.getPaginatedRecords();
    return (
      page.length > 0 && page.every((r) => this.selectedIds.has(r.id || 0))
    );
  }

  toggleSelectAll(): void {
    const page = this.getPaginatedRecords();
    if (this.isAllSelected()) {
      page.forEach((r) => this.selectedIds.delete(r.id || 0));
    } else {
      page.forEach((r) => this.selectedIds.add(r.id || 0));
    }
  }

  // ── SLA Helpers ───────────────────────────────────────
  getSlaHours(record: AitRecord): number {
    if (!record.createdAt) return this.SLA_HOURS;
    const created = new Date(record.createdAt).getTime();
    const deadline = created + this.SLA_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    return Math.round((deadline - now) / (1000 * 60 * 60));
  }

  getSlaDisplay(record: AitRecord): string {
    const hrs = this.getSlaHours(record);
    if (hrs < 0) return `⚠ ${Math.abs(hrs)} hrs over`;
    return `${hrs} hrs`;
  }

  //

  getSourceLabel(source: string): string {
    const map: Record<string, string> = {
      IMPORT: 'Import Duty',
      SUPPLIER: 'Supplier Payment',
      SALARY: 'Salary Deduction',
      CONTRACTOR: 'Contractor Payment',
      RENT: 'Rent Payment',
    };
    return map[source] ?? source;
  }

  getSourceClass(source: string): string {
    const map: Record<string, string> = {
      IMPORT: 'cat-import',
      SUPPLIER: 'cat-supplier',
      SALARY: 'cat-salary',
      CONTRACTOR: 'cat-contractor',
      RENT: 'cat-rent',
    };
    return map[source] ?? '';
  }

  getSourceIcon(source: string): string {
    const map: Record<string, string> = {
      IMPORT: 'bi-box-seam',
      SUPPLIER: 'bi-truck',
      SALARY: 'bi-person-badge',
      CONTRACTOR: 'bi-tools',
      RENT: 'bi-building',
    };
    return map[source] ?? 'bi-receipt';
  }

  getStatusClass(status: AitStatus): string {
    const map: Record<AitStatus, string> = {
      DRAFT: 'status-draft',
      SUBMITTED: 'status-submitted',
      PENDING: 'status-pending',
      PAID: 'status-pending',
      UNDER_REVIEW: 'status-review',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      CREDITED: 'status-credited',
      CANCELLED: 'status-cancelled',
    };
    return map[status] ?? 'status-draft';
  }

  // ── Actions ───────────────────────────────────────────
  reviewRecord(aitId: number): void {
    this.router.navigate(['..', 'review', aitId], { relativeTo: this.route });
  }

  viewDetails(aitId: number): void {
    this.router.navigate(['..', 'review', aitId], { relativeTo: this.route });
  }
 
  refreshQueue(): void {
    this.loadQueueData();
  }

  // ── Display Helpers ───────────────────────────────────
  getStatusColor(status: AitStatus): string {
    const map: Record<AitStatus, string> = {
      DRAFT: 'badge-draft',
      SUBMITTED: 'badge-submitted',
      PENDING: 'badge-pending',
      PAID: 'badge-paid',
      UNDER_REVIEW: 'badge-review',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      CREDITED: 'badge-credited',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || 'badge-draft';
  }

  getStatusLabel(status: AitStatus): string {
    const map: Record<AitStatus, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      PENDING: 'Pending',
      PAID: 'Paid',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CREDITED: 'Credited',
      CANCELLED: 'Cancelled',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ── Count by status (tabs-এ দরকার) ───────────────────────────────────────

  countByStatus(status: string): number {
    return this.allRecords.filter((r) => r.status === status).length;
  }

  // ── SLA filter (নতুন filter dropdown) ────────────────────────────────────

  slaFilter: string = '';

  onSlaFilterChange(value: string): void {
    this.slaFilter = value;
    this.applyFilters();
  }

  // ── Bulk assign ───────────────────────────────────────────────────────────

  bulkAssign(): void {
    // Phase 5 RBAC enhancement-এ implement হবে
    // এখন শুধু selected records-এর review page-এ navigate করো
    const ids = Array.from(this.selectedIds);
    if (ids.length === 1) {
      this.reviewRecord(ids[0]);
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────

  onExport(): void {
    // CSV export — Phase 5-এ implement হবে
    console.log('Export clicked');
  }

  // ── Math reference (template-এ min() দরকার) ──────────────────────────────

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
