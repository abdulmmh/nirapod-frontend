import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-activity-log-list',
  templateUrl: './activity-log-list.component.html',
  styleUrls: ['./activity-log-list.component.css']
})
export class ActivityLogListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
 searchText: string = '';

  logs = [
    {
      id: 1,
      user: 'Mahmud Hasan',
      action: 'Created Taxpayer',
      module: 'Taxpayer Management',
      dateTime: '2026-03-18 10:30 AM',
      status: 'Success'
    },
    {
      id: 2,
      user: 'Sadia Rahman',
      action: 'Updated Business Record',
      module: 'Business Registration',
      dateTime: '2026-03-18 11:15 AM',
      status: 'Success'
    },
    {
      id: 3,
      user: 'Tanvir Ahmed',
      action: 'Submitted VAT Return',
      module: 'VAT Returns',
      dateTime: '2026-03-18 12:05 PM',
      status: 'Pending'
    },
    {
      id: 4,
      user: 'Farzana Akter',
      action: 'Deleted Payment Entry',
      module: 'Payments',
      dateTime: '2026-03-18 01:40 PM',
      status: 'Failed'
    }
  ];

  get filteredLogs() {
    const keyword = this.searchText.toLowerCase();

    return this.logs.filter(item =>
      item.user.toLowerCase().includes(keyword) ||
      item.action.toLowerCase().includes(keyword) ||
      item.module.toLowerCase().includes(keyword) ||
      item.dateTime.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword)
    );
  }
}
