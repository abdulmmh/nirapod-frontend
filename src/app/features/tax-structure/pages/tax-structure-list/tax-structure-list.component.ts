import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaxStructureService } from 'src/app/core/services/tax-strcuture.service';

import { TaxStructure } from 'src/app/models/tax-structure.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector:    'app-tax-structure-list',
  templateUrl: './tax-structure-list.component.html',
  styleUrls:   ['./tax-structure-list.component.css'],
})
export class TaxStructureListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  taxes:      TaxStructure[] = [];
  searchTerm  = '';
  isLoading   = false;
  

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  constructor(
    private service: TaxStructureService,
    private router:  Router,
    private toast:  ToastService 
  ) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.isLoading = true;


    this.service.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  data  => { this.taxes = data; this.isLoading = false; },
        error: ()    => {
          this.toast.error('Could not load tax structures. Please try again.');
          this.isLoading = false;
        },
      });
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  get filtered(): TaxStructure[] {
    if (!this.searchTerm.trim()) return this.taxes;
    const term = this.searchTerm.toLowerCase();
    return this.taxes.filter(t =>
      t.taxCode.toLowerCase().includes(term)     ||
      t.taxName.toLowerCase().includes(term)     ||
      t.taxType.toLowerCase().includes(term)     ||
      t.applicableTo.toLowerCase().includes(term)||
      (t.rateType ?? '').toLowerCase().includes(term)
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

    // ─────────────────── Delete Flow ────────────────────────

  confirmDelete(id: number | undefined): void {
    if (!id) return;
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
    this.deleteTaxStructure(id);
  }

  deleteTaxStructure(id: number): void {
    if (!confirm('Are you sure you want to delete this tax structure?')) return;
    this.service.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.taxes = this.taxes.filter(t => t.id !== id); },
        error: () => { this.toast.error('Failed to delete. Please try again.'); },
      });
  }

    private handleDeleteSuccess(id: number): void {
    this.taxes = this.taxes.filter((t) => t.id !== id);
    this.toast.success('Tax structure deleted successfully.');
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete tax structure. Please try again.');
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }


  view(id: number):    void { this.router.navigate(['/tax-structure/view',   id]); }
  edit(id: number):    void { this.router.navigate(['/tax-structure/edit',   id]); }
  navigateCreate():    void { this.router.navigate(['/tax-structure/create']); }

  // ── Style Helpers ─────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Expired' ? 'status-suspended' : 'status-inactive';
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      'VAT':               'type-vat',
      'AIT':               'type-ait',
      'Import Duty':       'type-import',
      'Income Tax':        'type-it',
      'Excise Duty':       'type-excise',
      'Supplementary Duty':'type-sd',
      'Other':             'type-other',
    };
    return map[t] ?? '';
  }

  getRateDisplay(t: TaxStructure): string {
    return t.rateType === 'SLAB'
      ? `${t.slabs?.length ?? 0} slabs`
      : `${t.rate}%`;
  }

  isExpired(date: string): boolean { return !!date && new Date(date) < new Date(); }
}