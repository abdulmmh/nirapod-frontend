import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-list',
  templateUrl: './taxpayer-list.component.html',
  styleUrls: ['./taxpayer-list.component.css']
})
export class TaxpayerListComponent implements OnInit {

  taxpayers: Taxpayer[] = [];
  searchTerm = '';
  isLoading  = false;

  private destroy$ = new Subject<void>();
  
  showDeleteModal  = false;
  pendingDeleteId: number | null = null;


  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadTaxpayers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTaxpayers(): void {
      this.isLoading = true;
  
      this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => {
            this.taxpayers = data;
            this.isLoading  = false;
  
            // INFO: 
            if (data.length === 0) {
              this.toast.info('No taxpayers registered yet. Click "Register Taxpayer" to add one.');
            }
          },
          error: () => {
            this.isLoading = false;
            this.toast.error('Failed to load taxpayers. Please refresh the page.');
          }
        });
    }

  get filteredTaxpayers(): Taxpayer[] {
    if (!this.searchTerm.trim()) return this.taxpayers;
    const term = this.searchTerm.toLowerCase();
    return this.taxpayers.filter(tp =>
      tp.fullName.toLowerCase().includes(term) ||
      tp.tin.toLowerCase().includes(term)      ||
      tp.email.toLowerCase().includes(term)    ||
      tp.phone.includes(term)
    );
  }

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

    this.http.delete(API_ENDPOINTS.TAXPAYERS.DELETE(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.taxpayers = this.taxpayers.filter(t => t.id !== id);
          this.toast.success('Taxpayer deleted successfully.');
        },
        error: () => {
          this.toast.error('Failed to delete taxpayer. Please try again.');
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active':    'status-active',
      'Inactive':  'status-inactive',
      'Pending':   'status-pending',
      'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }

  viewTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/view' , id]);
  }

  editTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/edit', id]);
  }

}