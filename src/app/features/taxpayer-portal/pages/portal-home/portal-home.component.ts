import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Subject, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from 'src/app/models/taxpayer.model';
import { IncomeTaxReturn } from 'src/app/models/income-tax-return.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.css'],
})
export class PortalHomeComponent implements OnInit, OnDestroy {
  taxpayer: Taxpayer | null = null;
  isLoading = true;
  menuItems: { label: string; route: string; icon: string }[] = [];

  // ── ITR stats ─────────────────────────────────────────────────
  itrReturns: IncomeTaxReturn[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;

    if (!user?.taxpayerId) {
      this.isLoading = false;
      return;
    }

    const taxpayerId = Number(user.taxpayerId);

    forkJoin({
      taxpayer: this.http.get<Taxpayer>(
        API_ENDPOINTS.TAXPAYERS.GET(taxpayerId),
      ),
      returns: this.http
        .get<
          IncomeTaxReturn[]
        >(`${API_ENDPOINTS.INCOME_TAX_RETURNS.LIST}?taxpayerId=${taxpayerId}`)
        .pipe(catchError(() => of([]))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ taxpayer, returns }) => {
          this.taxpayer = taxpayer;
          this.itrReturns = returns;
          this.buildMenu(taxpayer.taxpayerType?.category ?? '');
          this.isLoading = false;

          if (taxpayer.approvalStatus) {
            this.authService.refreshApprovalStatus(taxpayer.approvalStatus);
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Stats computed from ITR data ──────────────────────────────

  get totalReturnsFiled(): number {
    return this.itrReturns.length;
  }

  get outstandingDues(): number {
    return this.itrReturns
      .filter((r) => r.status !== 'Accepted')
      .reduce((sum, r) => {
        const netPayable =
          r.netTaxPayable ??
          Math.max(0, (r.grossTax ?? 0) - (r.taxRebate ?? 0));
        const paid =
          (r.advanceTaxPaid ?? 0) + (r.withholdingTax ?? 0) + (r.taxPaid ?? 0);
        return sum + Math.max(0, netPayable - paid);
      }, 0);
  }

  get complianceScore(): number {
    if (this.itrReturns.length === 0) return 100;
    const accepted = this.itrReturns.filter(
      (r) => r.status === 'Accepted',
    ).length;
    return Math.round((accepted / this.itrReturns.length) * 100);
  }

  get complianceColor(): string {
    if (this.complianceScore >= 80) return '#1a7a4a';
    if (this.complianceScore >= 50) return '#e67e22';
    return '#c0392b';
  }

  get lastActivity(): string {
    if (this.itrReturns.length === 0) return '—';

    const sorted = [...this.itrReturns]
      .filter((r) => !!r.submissionDate)
      .sort(
        (a, b) =>
          new Date(b.submissionDate!).getTime() -
          new Date(a.submissionDate!).getTime(),
      );

    if (!sorted.length) return '—';

    const date = new Date(sorted[0].submissionDate!);
    return date.toLocaleDateString('en-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDues(amount: number): string {
    if (amount === 0) return '৳ 0';
    if (amount >= 100_000) return `৳ ${(amount / 100_000).toFixed(1)}L`;
    return `৳ ${amount.toLocaleString('en-BD')}`;
  }

  // ── Menu ──────────────────────────────────────────────────────

  private buildMenu(category: string): void {
    if (category === 'Individual') {
      this.menuItems = [
        { label: 'My TIN', route: '/my-portal/tin', icon: '🪪' },
        { label: 'My Businesses', route: '/my-portal/businesses', icon: '🏪' },
        { label: 'Income Tax Return', route: '/my-portal/itr', icon: '📋' },
        { label: 'AIT', route: '/my-portal/ait', icon: '📊' },
        { label: 'Payments', route: '/my-portal/payments', icon: '💳' },
        { label: 'Notices', route: '/my-portal/notices', icon: '🔔' },
        { label: 'My Audits', route: '/my-portal/audits', icon: '🔍' },
        { label: 'My Appeals', route: '/my-portal/appeals', icon: '⚖️' }
      ];
    } else if (category === 'Business') {
      this.menuItems = [
        { label: 'My TIN', route: '/my-portal/tin', icon: '🪪' },
        { label: 'My Businesses', route: '/my-portal/businesses', icon: '🏪' },
        {
          label: 'VAT Registration',
          route: '/my-portal/vat-registration',
          icon: '🏢',
        },
        { label: 'VAT Returns', route: '/my-portal/vat-returns', icon: '📋' },
        { label: 'Payments', route: '/my-portal/payments', icon: '💳' },
        { label: 'Notices', route: '/my-portal/notices', icon: '🔔' },
        { label: 'My Audits', route: '/my-portal/audits', icon: '🔍' },
      ];
    } else if (category === 'Organization') {
      this.menuItems = [
        { label: 'My TIN', route: '/my-portal/tin', icon: '🪪' },
        { label: 'Income Tax Return', route: '/my-portal/itr', icon: '📋' },
        { label: 'Documents', route: '/my-portal/documents', icon: '📁' },
        { label: 'Payments', route: '/my-portal/payments', icon: '💳' },
        { label: 'Notices', route: '/my-portal/notices', icon: '🔔' },
        { label: 'My Audits', route: '/my-portal/audits', icon: '🔍' },
        { label: 'My Appeals', route: '/my-portal/appeals', icon: '⚖️' }
      ];
    }
  }

  // ── Display helpers ───────────────────────────────────────────

  get displayName(): string {
    return (
      this.taxpayer?.fullName ||
      this.taxpayer?.companyName ||
      this.authService.currentUser?.fullName ||
      ''
    );
  }

  get taxpayerTypeName(): string {
    return (
      this.taxpayer?.taxpayerType?.typeName ||
      this.authService.currentUser?.taxpayerType ||
      ''
    );
  }

  get photoUrl(): string | null {
    return this.taxpayer?.photoPath
      ? 'http://localhost:8080' + this.taxpayer.photoPath
      : null;
  }

  // ── Profile Completion ────────────────────────────────────────

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

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
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
      if (!tp.fullName) missing.push('Full Name');
      if (!tp.nid) missing.push('NID Number');
      if (!tp.dateOfBirth) missing.push('Date of Birth');
      if (!tp.gender) missing.push('Gender');
      if (!tp.fathersName) missing.push("Father's Name");
      if (!tp.mothersName) missing.push("Mother's Name");
      if (!tp.phone) missing.push('Phone');
      if (!tp.email) missing.push('Email');
      if (!tp.profession) missing.push('Profession');
      if (!tp.presentAddress?.district) missing.push('District');
      if (!tp.presentAddress?.division) missing.push('Division');
      if (!tp.photoPath) missing.push('Profile Photo');
    } else {
      if (!tp.companyName) missing.push('Company Name');
      if (!tp.rjscNo) missing.push('RJSC Number');
      if (!tp.natureOfBusiness) missing.push('Nature of Business');
      if (!tp.authorizedPersonName) missing.push('Authorized Person');
      if (!tp.authorizedPersonNid) missing.push('Authorized Person NID');
      if (!tp.phone) missing.push('Phone');
      if (!tp.email) missing.push('Email');
      if (!tp.presentAddress?.district) missing.push('District');
      if (!tp.presentAddress?.division) missing.push('Division');
      if (!tp.photoPath) missing.push('Profile Photo');
    }

    return missing;
  }

  get isProfileApprovalReady(): boolean {
    if (!this.taxpayer) return false;
    return !!(
      this.taxpayer.presentAddress?.district &&
      this.taxpayer.presentAddress?.division
    );
  }

  logout(): void {
    this.authService.logout();
  }

  onComplete(): void {
    if (this.taxpayer?.id) {
      this.router.navigate(['/my-portal/taxpayers/edit', this.taxpayer.id], {
        queryParams: { returnUrl: '/my-portal' },
      });
    }
  }
}
