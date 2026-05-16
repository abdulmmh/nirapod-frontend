import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AitService } from '../../services/ait.service';
import { AitRecord, AitStatus } from '../../models/ait.model';

@Component({
  selector: 'app-officer-dashboard',
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css']
})
export class OfficerDashboardComponent implements OnInit {
  Math = Math;
  allRecords: AitRecord[] = [];
  filteredRecords: AitRecord[] = [];

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

  statusOptions: AitStatus[] = ['PAID', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
  isLoading: boolean = true;
  loadError: string | null = null;

  constructor(
    private aitService: AitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQueueData();
  }

  loadQueueData(): void {
    this.isLoading = true;
    this.loadError = null;

    this.aitService.getMyAssignedQueue().subscribe({
      next: (records) => {
        this.allRecords = records;
        this.calculateKPIs();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load queue:', err);
        this.loadError = 'Failed to load queue data. Please try again.';
        this.isLoading = false;
        // Fallback to mock data is handled in service
      }
    });
  }

  calculateKPIs(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.kpis.myQueue = this.allRecords.filter(r => r.status === 'UNDER_REVIEW').length;

    this.kpis.reviewedToday = this.allRecords.filter(r => {
      const updated = new Date(r.updatedAt || '');
      updated.setHours(0, 0, 0, 0);
      return updated.getTime() === today.getTime();
    }).length;

    this.kpis.approvedWeek = this.allRecords.filter(r => {
      const updated = new Date(r.updatedAt || '');
      return updated >= weekAgo && r.status === 'APPROVED';
    }).length;

    const overdue = this.allRecords.filter(r => r.status === 'UNDER_REVIEW').length;
    const total = this.allRecords.length;
    this.kpis.slaRiskPercent = total > 0 ? Math.round((overdue / total) * 100) : 0;
  }

  applyFilters(): void {
    let filtered = [...this.allRecords];

    // Tab filter
    if (this.activeTab !== 'ALL') {
      filtered = filtered.filter(r => r.status === this.activeTab);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.aitReferenceNo?.toLowerCase().includes(q) ||
        r.taxpayerName?.toLowerCase().includes(q) ||
        r.importDutyRefNo?.toLowerCase().includes(q)
      );
    }

    // Date range
    if (this.dateFilterFrom) {
      const fromDate = new Date(this.dateFilterFrom);
      filtered = filtered.filter(r => new Date(r.createdAt || '') >= fromDate);
    }
    if (this.dateFilterTo) {
      const toDate = new Date(this.dateFilterTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.createdAt || '') <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareA: any = a.createdAt;
      let compareB: any = b.createdAt;

      switch (this.sortBy) {
        case 'date':
          compareA = new Date(a.createdAt || '').getTime();
          compareB = new Date(b.createdAt || '').getTime();
          break;
        case 'amount':
          compareA = a.calculatedAitAmount;
          compareB = b.calculatedAitAmount;
          break;
        case 'ref_no':
          compareA = a.aitReferenceNo || '';
          compareB = b.aitReferenceNo || '';
          break;
      }

      if (compareA < compareB) return this.sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return this.sortOrder === 'asc' ? 1 : -1;
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
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  // Pagination
  getPaginatedRecords(): AitRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      window.scrollTo(0, 0);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo(0, 0);
    }
  }

  // Actions
  reviewRecord(aitId: number): void {
    this.router.navigate(['/aits/review', aitId]);
  }

  viewDetails(aitId: number): void {
    // Could open a modal or navigate to detail view
    console.log('View details for AIT:', aitId);
  }

  getStatusColor(status: AitStatus): string {
    const colors: Record<AitStatus, string> = {
      'DRAFT': 'badge-draft',
      'SUBMITTED': 'badge-submitted',
      'PENDING': 'badge-pending',
      'PAID': 'badge-paid',
      'UNDER_REVIEW': 'badge-review',
      'APPROVED': 'badge-approved',
      'REJECTED': 'badge-rejected',
      'CREDITED': 'badge-credited',
      'CANCELLED': 'badge-cancelled',
    };
    return colors[status] || 'badge-default';
  }

  getStatusLabel(status: AitStatus): string {
    const labels: Record<AitStatus, string> = {
      'DRAFT': 'Draft',
      'SUBMITTED': 'Submitted',
      'PENDING': 'Pending',
      'PAID': 'Paid',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CREDITED': 'Credited',
      'CANCELLED': 'Cancelled',
    };
    return labels[status] || 'Unknown';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Refresh data
  refreshQueue(): void {
    this.loadQueueData();
  }
}
