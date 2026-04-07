import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Tin } from '../../../../models/tin.model';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-tin-list',
  templateUrl: './tin-list.component.html',
  styleUrls: ['./tin-list.component.css']
})
export class TinListComponent implements OnInit {

  tins: Tin[] = [];
  searchTerm = '';
  isLoading  = false;

  private destroy$ = new Subject<void>();
  
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  constructor(private http: HttpClient, private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTins();
  }

  private loadTins(): void {
    this.http.get<Tin[]>(API_ENDPOINTS.TINS.LIST)
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: (data) => {
          this.tins = data;
          this.isLoading = false;
          if (data.length === 0) {
            this.toast.info('No TIN records found. Click "Register TIN" to add one.');
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load TIN records. Please try again later.');
        }
      });
  } 


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredTins(): Tin[] {
    if (!this.searchTerm.trim()) return this.tins;
    const term = this.searchTerm.toLowerCase();
    return this.tins.filter(t =>
      t.tinNumber.toLowerCase().includes(term)      ||
      t.taxpayerName.toLowerCase().includes(term)   ||
      t.tinCategory.toLowerCase().includes(term)    ||
      t.taxZone.toLowerCase().includes(term)        ||
      t.district.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'cat-individual',
      'Company':     'cat-company',
      'Partnership': 'cat-partner',
      'NGO':         'cat-ngo',
      'Government':  'cat-govt'
    };
    return map[c] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'bi bi-person-fill',
      'Company':     'bi bi-building-fill',
      'Partnership': 'bi bi-people-fill',
      'NGO':         'bi bi-heart-fill',
      'Government':  'bi bi-bank2'
    };
    return map[c] ?? 'bi bi-person-fill';
  }

  view(id: number): void { this.router.navigate(['/tin/view', id]); }
  edit(id: number): void { this.router.navigate(['/tin/edit', id]); }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.showDeleteModal = false;
    this.pendingDeleteId = null;

    this.http
      .delete(API_ENDPOINTS.TINS.DELETE(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.tins = this.tins.filter((t) => t.id !== id);
          this.toast.success('TIN deleted successfully.');
        },
        error: () => {
          this.toast.error('Failed to delete TIN. Please try again.');
        },
      });
  }
} 