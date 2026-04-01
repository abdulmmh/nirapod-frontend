import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-fiscal-year-list',
  templateUrl: './fiscal-year-list.component.html',
  styleUrls: ['./fiscal-year-list.component.css']
})
export class FiscalYearListComponent implements OnInit {

  years: FiscalYear[] = [];
  isLoading = false;

  private fallback: FiscalYear[] = [
    { id: 1, yearName: '2024-25', startDate: '2024-07-01', endDate: '2025-06-30', vatDueDay: 15, incomeTaxDueDate: '2024-11-30', isCurrentYear: true, status: 'Active', createdAt: '2024-07-01' },
    { id: 2, yearName: '2023-24', startDate: '2023-07-01', endDate: '2024-06-30', vatDueDay: 15, incomeTaxDueDate: '2023-11-30', isCurrentYear: false, status: 'Closed', createdAt: '2023-07-01' },
    { id: 3, yearName: '2022-23', startDate: '2022-07-01', endDate: '2023-06-30', vatDueDay: 15, incomeTaxDueDate: '2022-11-30', isCurrentYear: false, status: 'Closed', createdAt: '2022-07-01' },
    { id: 4, yearName: '2025-26', startDate: '2025-07-01', endDate: '2026-06-30', vatDueDay: 15, incomeTaxDueDate: '2025-11-30', isCurrentYear: false, status: 'Upcoming', createdAt: '2024-12-01' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.years = this.fallback; this.isLoading = false; }, 400);
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Upcoming' ? 'status-upcoming' : 'status-inactive';
  }

  setCurrent(id: number): void {
    this.years = this.years.map(y => ({
      ...y, isCurrentYear: y.id === id,
      status: y.id === id ? 'Active' : y.status === 'Active' ? 'Closed' : y.status
    }));
  }
}