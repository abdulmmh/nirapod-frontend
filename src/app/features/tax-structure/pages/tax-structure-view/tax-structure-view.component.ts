import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { TaxStructureService } from 'src/app/core/services/tax-strcuture.service';

import { TaxPreviewResponse, TaxStructure } from 'src/app/models/tax-structure.model';

@Component({
  selector:    'app-tax-structure-view',
  templateUrl: './tax-structure-view.component.html',
  styleUrls:   ['./tax-structure-view.component.css'],
})
export class TaxStructureViewComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  tax:       TaxStructure | null = null;
  isLoading  = true;
  errorMsg   = '';

  // ── Preview ───────────────────────────────────────────────────────────────
  previewAmount    = 100000;
  previewResult:   TaxPreviewResponse | null = null;
  isPreviewLoading = false;

  private taxId = 0;

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private service: TaxStructureService,
  ) {}

  ngOnInit(): void {
    this.taxId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.isLoading = true;
    this.service.getById(this.taxId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.tax       = data;
          this.isLoading = false;
          this.loadPreview();
        },
        error: () => {
          this.errorMsg  = 'Failed to load tax structure.';
          this.isLoading = false;
        },
      });
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  loadPreview(): void {
    if (!this.tax || this.previewAmount <= 0) return;
    this.isPreviewLoading = true;
    this.service.previewById(this.taxId, this.previewAmount)
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$),
      )
      .subscribe(result => {
        this.previewResult    = result;
        this.isPreviewLoading = false;
      });
  }

  onPreviewAmountChange(): void { this.loadPreview(); }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Expired' ? 'status-suspended' : 'status-inactive';
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      'VAT': 'type-vat', 'AIT': 'type-ait', 'Import Duty': 'type-import',
      'Income Tax': 'type-it', 'Excise Duty': 'type-excise',
      'Supplementary Duty': 'type-sd',
    };
    return map[t] ?? '';
  }

  isExpired(date: string): boolean { return !!date && new Date(date) < new Date(); }
  hasBeenUpdated(): boolean { return !!(this.tax?.updatedAt); }

  onEdit(): void { this.router.navigate(['/tax-structure/edit', this.tax?.id]); }
  onBack(): void { this.router.navigate(['/tax-structure']); }
}