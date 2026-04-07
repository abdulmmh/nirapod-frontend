import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Tin } from '../../../../models/tin.model';

@Component({
  selector: 'app-tin-list',
  templateUrl: './tin-list.component.html',
  styleUrls: ['./tin-list.component.css']
})
export class TinListComponent implements OnInit {

  tins: Tin[] = [];
  searchTerm = '';
  isLoading  = false;

  

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Tin[]>(API_ENDPOINTS.TIN.LIST).subscribe({
      next: data => { this.tins = data;           this.isLoading = false; },
      error: ()   => { this.tins = this.fallback; this.isLoading = false; }
    });
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

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this TIN record?')) return;
    this.http.delete(API_ENDPOINTS.TIN.DELETE(id)).subscribe({
      next: () => { this.tins = this.tins.filter(t => t.id !== id); },
      error: ()  => { alert('Failed to delete TIN record, Please try again.'); }
    });
  }
} 