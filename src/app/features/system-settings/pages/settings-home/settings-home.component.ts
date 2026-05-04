import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-settings-home',
  templateUrl: './settings-home.component.html',
  styleUrls: ['./settings-home.component.css']
})
export class SettingsHomeComponent implements OnInit {

  private readonly toast = inject(ToastService);

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
    this.toast.success('Settings saved successfully!');
  }
}