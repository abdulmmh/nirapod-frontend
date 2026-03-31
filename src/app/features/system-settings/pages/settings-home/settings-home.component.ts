import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-home',
  templateUrl: './settings-home.component.html',
  styleUrls: ['./settings-home.component.css']
})
export class SettingsHomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
 settings = {
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    maintenanceMode: false
  };

  saveSettings(): void {
    console.log('Settings Saved:', this.settings);
    alert('Settings saved successfully!');
  }
}