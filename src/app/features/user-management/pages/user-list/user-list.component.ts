import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
 searchText: string = '';

  users = [
    {
      id: 1,
      fullName: 'Mahmud Hasan',
      email: 'mahmud.hasan@gov.bd',
      phone: '01711000001',
      role: 'Admin',
      department: 'System Administration',
      status: 'Active'
    },
    {
      id: 2,
      fullName: 'Sadia Rahman',
      email: 'sadia.rahman@gov.bd',
      phone: '01822000002',
      role: 'Tax Officer',
      department: 'Tax Operations',
      status: 'Active'
    },
    {
      id: 3,
      fullName: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@gov.bd',
      phone: '01933000003',
      role: 'Auditor',
      department: 'Audit Division',
      status: 'Inactive'
    },
    {
      id: 4,
      fullName: 'Farzana Akter',
      email: 'farzana.akter@gov.bd',
      phone: '01644000004',
      role: 'Report Analyst',
      department: 'Analytics & Reports',
      status: 'Pending'
    }
  ];

  get filteredUsers() {
    const keyword = this.searchText.toLowerCase();

    return this.users.filter(item =>
      item.fullName.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.phone.toLowerCase().includes(keyword) ||
      item.role.toLowerCase().includes(keyword) ||
      item.department.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword)
    );
  }
}
