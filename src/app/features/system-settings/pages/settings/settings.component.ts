import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  activeTab = 'general';
  isSaving  = false;
  successMsg = '';

  general = {
    systemName:    'National VAT & Tax Management System',
    systemCode:    'NVTMS',
    organization:  'National Board of Revenue (NBR)',
    country:       'Bangladesh',
    timezone:      'Asia/Dhaka',
    currency:      'BDT (৳)',
    dateFormat:    'DD/MM/YYYY',
    language:      'English',
    maintenanceMode: false
  };

  email = {
    smtpHost:     'smtp.nbr.gov.bd',
    smtpPort:     587,
    smtpUser:     'noreply@nbr.gov.bd',
    smtpPassword: '••••••••',
    senderName:   'NBR Tax System',
    senderEmail:  'noreply@nbr.gov.bd',
    enableSSL:    true,
    enableNotifications: true
  };

  security = {
    sessionTimeout:    30,
    maxLoginAttempts:  5,
    passwordMinLength: 8,
    requireTwoFactor:  false,
    enableAuditLog:    true,
    ipWhitelisting:    false
  };

  systemInfo = {
    version:     'v2.0.0',
    buildDate:   '2026-03-01',
    environment: 'Production',
    dbVersion:   'MySQL 8.0.35',
    angularVer:  '17.0.0',
    springVer:   '3.2.0',
    javaVer:     'Java 17 LTS',
    lastBackup:  '2026-04-01 03:00:00',
    uptime:      '99.98%',
    totalUsers:  32
  };

  tabs = [
    { id: 'general',  label: 'General',  icon: 'bi bi-sliders' },
    { id: 'email',    label: 'Email',    icon: 'bi bi-envelope-fill' },
    { id: 'security', label: 'Security', icon: 'bi bi-shield-fill-check' },
    { id: 'info',     label: 'System Info', icon: 'bi bi-info-circle-fill' },
  ];

  onSave(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'Settings saved successfully!';
      setTimeout(() => this.successMsg = '', 3000);
    }, 800);
  }
}