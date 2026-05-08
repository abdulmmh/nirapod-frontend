import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from 'src/app/models/taxpayer.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.css']
})
export class PortalHomeComponent implements OnInit, OnDestroy {

  taxpayer: Taxpayer | null = null;
  isLoading = true;
  menuItems: { label: string; route: string; icon: string }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user?.taxpayerId) {
      this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(user.taxpayerId))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.taxpayer = data;
            this.buildMenu(data.taxpayerType?.category ?? '');
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
        });
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildMenu(category: string): void {
    if (category === 'Individual') {
      this.menuItems = [
        { label: 'My TIN',            route: 'tin',                icon: '🪪' },
        { label: 'Income Tax Return', route: 'itr',                icon: '📋' },
        { label: 'AIT',               route: 'ait',                icon: '📊' },
        { label: 'Payments',          route: 'payments',           icon: '💳' },
        { label: 'Notices',           route: 'notices',            icon: '🔔' },
      ];
    } else if (category === 'Business') {
      this.menuItems = [
        { label: 'My TIN',           route: 'tin',              icon: '🪪' },
        { label: 'VAT Registration', route: 'vat-registration', icon: '🏢' },
        { label: 'VAT Returns',      route: 'vat-returns',      icon: '📋' },
        { label: 'Payments',         route: 'payments',         icon: '💳' },
        { label: 'Notices',          route: 'notices',          icon: '🔔' },
      ];
    } else if (category === 'Organization') {
      this.menuItems = [
        { label: 'My TIN',            route: 'tin',                icon: '🪪' },
        { label: 'Income Tax Return', route: 'itr',                icon: '📋' },
        { label: 'Documents',         route: 'documents',          icon: '📁' },
        { label: 'Payments',          route: 'payments',           icon: '💳' },
        { label: 'Notices',           route: 'notices',            icon: '🔔' },
      ];
    }
  }

  // ── Display helpers ──────────────────────────────────────────

  get displayName(): string {
    return this.taxpayer?.fullName
      || this.taxpayer?.companyName
      || this.authService.currentUser?.fullName
      || '';
  }

  get taxpayerTypeName(): string {
    return this.taxpayer?.taxpayerType?.typeName
      || this.authService.currentUser?.taxpayerType
      || '';
  }

  get photoUrl(): string | null {
    return this.taxpayer?.photoPath
      ? 'http://localhost:8080' + this.taxpayer.photoPath
      : null;
  }

  // ── Profile Completion ───────────────────────────────────────

  get profileCompletion(): number {
    if (!this.taxpayer) return 0;
    const tp = this.taxpayer;
    const category = tp.taxpayerType?.category?.toLowerCase() || '';

    let fields: boolean[];

    if (category === 'individual') {
      fields = [
        !!tp.fullName,
        !!tp.nid,
        !!tp.dateOfBirth,
        !!tp.gender,
        !!tp.phone,
        !!tp.email,
        !!tp.profession,
        !!tp.fathersName,
        !!tp.mothersName,
        !!tp.presentAddress?.district,
        !!tp.presentAddress?.division,
        !!tp.photoPath,
      ];
    } else {
      fields = [
        !!tp.companyName,
        !!tp.rjscNo,
        !!tp.natureOfBusiness,
        !!tp.authorizedPersonName,
        !!tp.authorizedPersonNid,
        !!tp.phone,
        !!tp.email,
        !!tp.presentAddress?.district,
        !!tp.presentAddress?.division,
        !!tp.photoPath,
      ];
    }

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }

  get completionColor(): string {
    if (this.profileCompletion >= 80) return '#1a7a4a';
    if (this.profileCompletion >= 50) return '#e67e22';
    return '#c0392b';
  }

  get missingFields(): string[] {
    if (!this.taxpayer) return [];
    const tp = this.taxpayer;
    const category = tp.taxpayerType?.category?.toLowerCase() || '';
    const missing: string[] = [];

    if (category === 'individual') {
      if (!tp.fullName)                 missing.push('Full Name');
      if (!tp.nid)                      missing.push('NID Number');
      if (!tp.dateOfBirth)              missing.push('Date of Birth');
      if (!tp.gender)                   missing.push('Gender');
      if (!tp.fathersName)              missing.push("Father's Name");
      if (!tp.mothersName)              missing.push("Mother's Name");
      if (!tp.phone)                    missing.push('Phone');
      if (!tp.email)                    missing.push('Email');
      if (!tp.profession)               missing.push('Profession');
      if (!tp.presentAddress?.district) missing.push('District');
      if (!tp.presentAddress?.division) missing.push('Division');
      if (!tp.photoPath)                missing.push('Profile Photo');
    } else {
      if (!tp.companyName)              missing.push('Company Name');
      if (!tp.rjscNo)                   missing.push('RJSC Number');
      if (!tp.natureOfBusiness)         missing.push('Nature of Business');
      if (!tp.authorizedPersonName)     missing.push('Authorized Person');
      if (!tp.authorizedPersonNid)      missing.push('Authorized Person NID');
      if (!tp.phone)                    missing.push('Phone');
      if (!tp.email)                    missing.push('Email');
      if (!tp.presentAddress?.district) missing.push('District');
      if (!tp.presentAddress?.division) missing.push('Division');
      if (!tp.photoPath)                missing.push('Profile Photo');
    }

    return missing;
  }

  logout(): void {
    this.authService.logout();
  }
}