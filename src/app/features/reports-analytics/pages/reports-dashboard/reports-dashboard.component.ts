import { Component } from '@angular/core';

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent {

  selectedPeriod = 'monthly';
  selectedYear   = '2024-25';

  periods = ['Monthly', 'Quarterly', 'Annually'];
  years   = ['2024-25', '2023-24', '2022-23'];

  reportCards = [
    { title: 'VAT Collection Report',      icon: 'bi bi-receipt-cutoff',       color: 'teal',   desc: 'Monthly VAT collection summary by zone and circle',      count: '₹45.9 Cr' },
    { title: 'Income Tax Returns Report',  icon: 'bi bi-file-earmark-text-fill', color: 'purple', desc: 'ITR filing status and tax collection analysis',           count: '24,850' },
    { title: 'Import Duty Report',         icon: 'bi bi-truck-front-fill',       color: 'red',    desc: 'Import duty assessments and clearances by port',          count: '1,205' },
    { title: 'AIT Deduction Report',       icon: 'bi bi-percent',               color: 'violet', desc: 'Advance income tax deductions by source type',            count: '৳8.2 Cr' },
    { title: 'Penalty Collection Report',  icon: 'bi bi-exclamation-triangle-fill', color: 'orange', desc: 'Penalty and fine collections with status breakdown',   count: '315' },
    { title: 'Refund Status Report',       icon: 'bi bi-cash-stack',            color: 'blue',   desc: 'Pending and completed refund claims analysis',            count: '89' },
    { title: 'Audit Summary Report',       icon: 'bi bi-shield-fill-check',     color: 'navy',   desc: 'Audit assignments, findings and resolutions',             count: '142' },
    { title: 'Taxpayer Registration Report', icon: 'bi bi-people-fill',         color: 'green',  desc: 'New taxpayer registrations and TIN issuance trends',      count: '+1,240' },
  ];

  summaryStats = [
    { label: 'Total Revenue (FY 2024-25)', value: '৳45.9 Cr', change: '+8.3%', icon: 'bi bi-currency-dollar', color: 'green' },
    { label: 'VAT Collected',              value: '৳28.2 Cr', change: '+12.1%', icon: 'bi bi-receipt-cutoff', color: 'teal' },
    { label: 'IT Collections',             value: '৳12.4 Cr', change: '+5.7%', icon: 'bi bi-file-earmark-text-fill', color: 'purple' },
    { label: 'Import Duty',                value: '৳5.3 Cr',  change: '+3.2%', icon: 'bi bi-truck-front-fill', color: 'red' },
  ];

  downloadReport(title: string): void {
    alert(`Downloading: ${title}`);
  }
}