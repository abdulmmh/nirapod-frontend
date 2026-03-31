import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports-home',
  templateUrl: './reports-home.component.html',
  styleUrls: ['./reports-home.component.css']
})
export class ReportsHomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  reportCards = [
    {
      title: 'Monthly Tax Collection',
      value: '৳ 12.8Cr',
      description: 'Total tax collected this month'
    },
    {
      title: 'VAT Return Submissions',
      value: '3,145',
      description: 'Returns submitted in current period'
    },
    {
      title: 'Pending Audits',
      value: '148',
      description: 'Audits awaiting completion'
    },
    {
      title: 'Refund Requests',
      value: '67',
      description: 'Refunds currently under process'
    }
  ];

  recentReports = [
    'Tax Collection Summary - March 2026',
    'VAT Return Filing Report - March 2026',
    'Pending Audit Status Report',
    'Monthly Business Registration Report',
    'Taxpayer Growth Analysis Report'
  ];
}
