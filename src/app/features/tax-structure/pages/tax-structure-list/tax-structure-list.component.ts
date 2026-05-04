import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';


@Component({
  selector: 'app-tax-structure-list',
  templateUrl: './tax-structure-list.component.html',
  styleUrls: ['./tax-structure-list.component.css']
})
export class TaxStructureListComponent implements OnInit {

  private readonly toast = inject(ToastService);

  taxes: TaxStructure[] = [];
  searchTerm = '';
  isLoading  = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private fallback: TaxStructure[] = [
    { id: 1, taxCode: 'TAX-001', taxName: 'Standard VAT', taxType: 'VAT', rate: 15, applicableTo: 'All', effectiveDate: '2024-01-01', expiryDate: '', description: 'Standard VAT rate applicable to all taxable goods and services', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 2, taxCode: 'TAX-002', taxName: 'Reduced VAT', taxType: 'VAT', rate: 5, applicableTo: 'Goods', effectiveDate: '2024-01-01', expiryDate: '', description: 'Reduced VAT for essential goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 3, taxCode: 'TAX-003', taxName: 'AIT on Salary', taxType: 'AIT', rate: 10, applicableTo: 'Individual', effectiveDate: '2024-07-01', expiryDate: '', description: 'Advance Income Tax deducted at source from salary', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-07-01' },
    { id: 4, taxCode: 'TAX-004', taxName: 'AIT on Import', taxType: 'AIT', rate: 5, applicableTo: 'Import', effectiveDate: '2024-01-01', expiryDate: '', description: 'AIT on import of goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 5, taxCode: 'TAX-005', taxName: 'General Import Duty', taxType: 'Import Duty', rate: 25, applicableTo: 'Import', effectiveDate: '2024-01-01', expiryDate: '', description: 'Standard import duty on general goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 6, taxCode: 'TAX-006', taxName: 'Electronics Import Duty', taxType: 'Import Duty', rate: 10, applicableTo: 'Import', effectiveDate: '2024-01-01', expiryDate: '2024-12-31', description: 'Reduced duty on electronics', status: 'Expired', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 7, taxCode: 'TAX-007', taxName: 'Supplementary Duty', taxType: 'Supplementary Duty', rate: 20, applicableTo: 'Goods', effectiveDate: '2024-01-01', expiryDate: '', description: 'SD on luxury goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 8, taxCode: 'TAX-008', taxName: 'AIT on Contract', taxType: 'AIT', rate: 7, applicableTo: 'Company', effectiveDate: '2024-01-01', expiryDate: '', description: 'AIT on contract payments to companies', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
  
];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST).subscribe({
      next: data => { this.taxes = data;           this.isLoading = false; },
      error: ()   => {
        this.taxes = this.fallback;
        this.isLoading = false;
        this.toast.error('Failed to load tax structures. Showing sample data.');
      }
    });
    // setTimeout(() => { this.taxes = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): TaxStructure[] {
    if (!this.searchTerm.trim()) return this.taxes;
    const term = this.searchTerm.toLowerCase();
    return this.taxes.filter(t =>
      t.taxCode.toLowerCase().includes(term)  ||
      t.taxName.toLowerCase().includes(term)  ||
      t.taxType.toLowerCase().includes(term)  ||
      t.applicableTo.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Expired' ? 'status-suspended' : 'status-inactive';
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      'VAT': 'type-vat', 'AIT': 'type-ait',
      'Import Duty': 'type-import', 'Income Tax': 'type-it',
      'Excise Duty': 'type-excise', 'Supplementary Duty': 'type-sd', 'Other': 'type-other'
    };
    return map[t] ?? '';
  }

  isExpired(date: string): boolean { return !!date && new Date(date) < new Date(); }

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
        this.http.delete(API_ENDPOINTS.TAX_STRUCTURES.DELETE(id)).subscribe({
          next: () => {
            this.taxes = this.taxes.filter(t => t.id !== id);
            this.toast.success('Tax structure deleted successfully.');
          },
          error: ()  => { this.toast.error('Failed to delete tax structure, Please try again.'); }
        });
  
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  view(id: number): void { this.router.navigate(['/tax-structure/view', id]); }
  edit(id: number): void { this.router.navigate(['/tax-structure/edit', id]); }
  
  navigateCreate(): void { this.router.navigate(['/tax-structure/create']); }
}
