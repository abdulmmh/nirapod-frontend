import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppealService } from '../../service/appeal.service';
import { Appeal } from '../../model/appeal.model';

@Component({
  selector: 'app-appeal-list',
  templateUrl: './appeal-list.component.html',
  styleUrls: ['./appeal-list.component.css']
})
export class AppealListComponent implements OnInit {

  appeals:      Appeal[] = [];
  isLoading     = false;
  searchTerm    = '';
  filterStatus  = '';

  kpis: { [key: string]: number } | null = null;

  readonly statuses = [
    { value: 'FILED',             label: 'Filed' },
    { value: 'UNDER_REVIEW',      label: 'Under Review' },
    { value: 'HEARING_SCHEDULED', label: 'Hearing Scheduled' },
    { value: 'DECIDED',           label: 'Decided' },
    { value: 'CLOSED',            label: 'Closed' },
    { value: 'WITHDRAWN',         label: 'Withdrawn' },
  ];

  /** Maps each clickable KPI card to the single status value it filters by. */
  readonly kpiStatusMap: Record<string, string> = {
    filed:            'FILED',
    underReview:      'UNDER_REVIEW',
    hearingScheduled: 'HEARING_SCHEDULED',
    decided:          'DECIDED',
    closed:           'CLOSED',
    withdrawn:        'WITHDRAWN',
  };

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  constructor(
    private appealService: AppealService,
    private router:        Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadKpis();
  }

  load(): void {
    this.isLoading = true;
    this.appealService.getAll().subscribe({
      next: data => { this.appeals = data; this.isLoading = false; },
      error: ()   => { this.isLoading = false; }
    });
  }

  loadKpis(): void {
    this.appealService.getKpis().subscribe({
      next: k => this.kpis = k,
      error: () => {}
    });
  }

  get filtered(): Appeal[] {
    return this.appeals.filter(a => {
      const matchSearch = !this.searchTerm ||
        a.appealNo?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.taxpayerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.tinNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm   = '';
    this.filterStatus = '';
    this.currentPage  = 1;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterStatus);
  }

  /** Called when a clickable KPI card is clicked — toggles the status filter. */
  onKpiCardClick(kpiKey: string): void {
    const status = this.kpiStatusMap[kpiKey];
    this.filterStatus = this.filterStatus === status ? '' : status;
    this.currentPage = 1;
  }

  isKpiActive(kpiKey: string): boolean {
    return this.filterStatus === this.kpiStatusMap[kpiKey];
  }

  /** Any filter/search change resets back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): Appeal[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filtered.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
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

  view(id: number): void {
    this.router.navigate(['/appeals', id]);
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      FILED:             'badge-info',
      UNDER_REVIEW:      'badge-warning',
      HEARING_SCHEDULED: 'badge-orange',
      DECIDED:           'badge-purple',
      CLOSED:            'badge-muted',
      WITHDRAWN:         'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string {
    return s?.replace(/_/g, ' ') ?? s;
  }

  getDecisionClass(d: string): string {
    const m: Record<string, string> = {
      UPHELD:           'badge-success',
      PARTIALLY_UPHELD: 'badge-lime',
      DISMISSED:        'badge-danger',
    };
    return m[d] ?? 'badge-secondary';
  }
}