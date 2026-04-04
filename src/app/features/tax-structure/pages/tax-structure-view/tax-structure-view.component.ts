import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxStructure } from '../../../../models/tax-structure.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-tax-structure-view',
  templateUrl: './tax-structure-view.component.html',
  styleUrls: ['./tax-structure-view.component.css']
})
export class TaxStructureViewComponent implements OnInit {

  tax: TaxStructure | null = null;
  isLoading = true;

  private fallback: TaxStructure[] = [
    { id: 1, taxCode: 'TAX-001', taxName: 'Standard VAT', taxType: 'VAT', rate: 15, applicableTo: 'All', effectiveDate: '2024-01-01', expiryDate: '', description: 'Standard VAT rate applicable to all taxable goods and services', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 2, taxCode: 'TAX-002', taxName: 'Reduced VAT', taxType: 'VAT', rate: 5, applicableTo: 'Goods', effectiveDate: '2024-01-01', expiryDate: '', description: 'Reduced VAT for essential goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
    { id: 3, taxCode: 'TAX-003', taxName: 'AIT on Salary', taxType: 'AIT', rate: 10, applicableTo: 'Individual', effectiveDate: '2024-07-01', expiryDate: '', description: 'Advance Income Tax deducted at source from salary', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-07-01' },
    { id: 5, taxCode: 'TAX-005', taxName: 'General Import Duty', taxType: 'Import Duty', rate: 25, applicableTo: 'Import', effectiveDate: '2024-01-01', expiryDate: '', description: 'Standard import duty on general goods', status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient  
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.GET(id)).subscribe({
          next: data => { this.tax = data; this.isLoading = false; },
          error: ()  => {
            this.tax = this.fallback.find(t => t.id === id) || this.fallback[0];
            this.isLoading = false;
          }
        });
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Expired' ? 'status-suspended' : 'status-inactive';
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      'VAT': 'type-vat', 'AIT': 'type-ait',
      'Import Duty': 'type-import', 'Income Tax': 'type-it',
      'Excise Duty': 'type-excise', 'Supplementary Duty': 'type-sd'
    };
    return map[t] ?? '';
  }

  isExpired(date: string): boolean { return !!date && new Date(date) < new Date(); }

  onEdit(): void { this.router.navigate(['/tax-structure/edit', this.tax?.id]); }
  onBack(): void { this.router.navigate(['/tax-structure']); }
}