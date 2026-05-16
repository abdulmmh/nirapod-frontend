import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AitService } from '../../services/ait.service';
import { AitRecord, AitStatus } from '../../models/ait.model';

interface KPIMetrics {
  totalCount: number;
  needsActionCount: number;
  approvedCount: number;
  creditedAmount: number;
}

@Component({
  selector: 'app-ait-dashboard',
  templateUrl: './ait-dashboard.component.html',
  styleUrls: ['./ait-dashboard.component.css']
})
export class AitDashboardComponent implements OnInit {
  records: AitRecord[] = [];
  filteredRecords: AitRecord[] = [];
  loading = true;
  error: string | null = null;

  // Filter state
  selectedStatus: string = '';
  selectedFiscalYear: string = 'FY 2024-2025';
  searchQuery: string = '';
  currentPage = 1;
  pageSize = 7;

  // KPI metrics
  kpis: KPIMetrics = {
    totalCount: 0,
    needsActionCount: 0,
    approvedCount: 0,
    creditedAmount: 0
  };

  // Tax payer info (would come from auth service in real app)
  taxpayerInfo = {
    fiscalYear: '2024-2025',
    tin: '123456789012'
  };

  statusColors: { [key in AitStatus]?: string } = {
    'DRAFT': 'b-draft',
    'SUBMITTED': 'b-submitted',
    'PENDING': 'b-pending',
    'PAID': 'b-paid',
    'UNDER_REVIEW': 'b-review',
    'APPROVED': 'b-approved',
    'REJECTED': 'b-rejected',
    'CREDITED': 'b-credited',
    'CANCELLED': 'b-cancelled'
  };

  statusLabels: { [key in AitStatus]?: string } = {
    'DRAFT': 'Draft',
    'SUBMITTED': 'Submitted',
    'PENDING': 'Payment Pending',
    'PAID': 'Paid',
    'UNDER_REVIEW': 'Under Review',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
    'CREDITED': '✓ Credited to ITR',
    'CANCELLED': 'Cancelled'
  };

  constructor(
    private aitService: AitService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRecords();
  }

  private loadRecords() {
    this.loading = true;
    this.error = null;
    this.aitService.getAll().subscribe({
      next: (data) => {
        this.records = data;
        this.calculateKPIs();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load AIT records. Showing offline data.';
        this.loading = false;
      }
    });
  }

  private calculateKPIs() {
    this.kpis.totalCount = this.records.length;
    this.kpis.needsActionCount = this.records.filter(
      r => ['DRAFT', 'PENDING', 'SUBMITTED'].includes(r.status)
    ).length;
    this.kpis.approvedCount = this.records.filter(r => r.status === 'APPROVED').length;
    this.kpis.creditedAmount = this.records
      .filter(r => r.status === 'CREDITED')
      .reduce((sum, r) => sum + (r.calculatedAitAmount || 0), 0);
  }

  applyFilters() {
    let filtered = [...this.records];

    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.aitReferenceNo?.toLowerCase().includes(query)) ||
        (r.hsCode?.toLowerCase().includes(query))
      );
    }

    this.filteredRecords = filtered;
    this.currentPage = 1;
  }

  onStatusFilterChange(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  onFiscalYearChange(year: string) {
    this.selectedFiscalYear = year;
    this.applyFilters();
  }

  getPaginatedRecords(): AitRecord[] {
    const startIdx = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(startIdx, startIdx + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.pageSize);
  }

  getPaginationStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPaginationEnd(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.filteredRecords.length);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getStatusBadgeClass(status: AitStatus): string {
    return this.statusColors[status] || 'b-draft';
  }

  getStatusLabel(status: AitStatus): string {
    return this.statusLabels[status] || status;
  }

  viewRecord(id: number | undefined) {
    if (id) {
      this.router.navigate(['/aits/view', id]);
    }
  }

  continueEditingDraft(id: number | undefined) {
    if (id) {
      this.router.navigate(['/aits/edit', id]);
    }
  }

  createNewAit() {
    this.router.navigate(['/aits/create']);
  }

  uploadDocuments(id: number | undefined) {
    if (id) {
      this.router.navigate(['/aits/upload-docs', id]);
    }
  }

  getRowHighlight(status: AitStatus): string {
    if (status === 'PENDING') return 'row-highlight-warning';
    if (status === 'REJECTED') return 'row-highlight-danger';
    return '';
  }
}
