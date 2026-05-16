import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxCircle, TaxZone } from 'src/app/models/master-data.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';
import { District } from '../../../../models/master-data.model';

@Component({
  selector: 'app-taxpayer-view',
  templateUrl: './taxpayer-view.component.html',
  styleUrls: ['./taxpayer-view.component.css'],
})
export class TaxpayerViewComponent implements OnInit, OnDestroy {
  // ────────────────── Properties ──────────────────────

  taxpayer: Taxpayer | null = null;
  isLoading = true;
  taxpayerId: number | null = null;
  isUploadingPhoto = false;
  photoPreview: string | null = null;

  private destroy$ = new Subject<void>();

  // Zone & Circle
  zones: TaxZone[] = [];
  circles: TaxCircle[] = [];
  loadingZones = false;
  loadingCircles = false;
  isProcessing = false;

  // Form fields
  selectedZoneId: number | null = null;
  approveZone = '';
  approveCircle = '';
  reviewNotes = '';

  // Notice Modal
  showNoticeModal = false;
  noticeSubject = '';
  noticeBody = '';
  noticeType = 'General';
  noticePriority = 'Normal';
  isSendingNotice = false;

  // ──────────────────── Constructor ───────────────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private authService: AuthService,
  ) {}

  // ────────────────────── Lifecycle ──────────────────────

  ngOnInit(): void {
    this.initializeTaxpayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ────────────────────── Initialization  ─────────────────────

  private initializeTaxpayer(): void {
    const id = this.getValidTaxpayerId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.taxpayerId = id;
    this.fetchTaxpayer();
  }

  private getValidTaxpayerId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.toast.error('Invalid taxpayer ID. Please go back and try again.');
    this.isLoading = false;
  }

  private fetchTaxpayer(): void {
    if (!this.taxpayerId) return;

    this.isLoading = true;

    this.http
      .get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Taxpayer): void {
    this.taxpayer = data;
  }

  private handleFetchError(error: any): void {
    this.toast.error('Failed to fetch taxpayer details. Please try again.');
    this.isLoading = false;
  }

  // ───────────────────── Helper Methods ────────────────────────

  getDisplayName(taxpayer: any): string {
    const category = taxpayer?.taxpayerType?.category?.toLowerCase() || '';

    if (category === 'business' || category === 'organization') {
      return taxpayer.companyName || 'Unknown Company';
    } else {
      return taxpayer.fullName || 'Unknown Individual';
    }
  }

  get isCompany(): boolean {
    const category = this.taxpayer?.taxpayerType?.category?.toLowerCase() || '';
    return category === 'business' || category === 'organization';
  }

  get isIndividual(): boolean {
    const category = this.taxpayer?.taxpayerType?.category?.toLowerCase() || '';
    return category === 'individual';
  }


  get canReview(): boolean {
    const role = this.authService.userRole;
    return role === Role.SUPER_ADMIN || 
          role === Role.TAX_COMMISSIONER || 
          role === Role.TAX_OFFICER;
  }

  get isPendingReview(): boolean {
    return this.taxpayer?.approvalStatus === 'PENDING_REVIEW';
  }

  get isApproved(): boolean {
    return this.taxpayer?.approvalStatus === 'APPROVED';
  }

  get isRejected(): boolean {
    return this.taxpayer?.approvalStatus === 'REJECTED';
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('File must be less than 5MB.');
      return;
    }



    // Preview
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  getPhotoUrl(photoPath: string): string {
    return 'http://localhost:8080' + photoPath;
  }

  // ───────────────────── Navigation ────────────────────────

  onEdit(): void {
    if (!this.taxpayer?.id) return;
    this.router.navigate(['/taxpayers/edit', this.taxpayer.id]);
  }

  onBack(): void {
    this.router.navigate(['/taxpayers']);
  }

  // ────────────────────── UI Helpers ──────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Inactive: 'status-inactive',
      Pending: 'status-pending',
      Suspended: 'status-suspended',
    };
    return map[status] ?? '';
  }

  loadZones(): void {
    // taxpayer এর district থেকে zone load করব
    const district = this.taxpayer?.presentAddress?.district;
    if (!district) {
      this.toast.warning('Taxpayer has no district address. Please edit profile first.');
      return;
    }

    this.loadingZones = true;
    // আগে সব districts load করে match করব
    this.http.get<District[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS)
      .subscribe({
        next: (districts) => {
          const matched = districts.find(d => 
            d.name.toLowerCase() === district.toLowerCase()
          );
          if (matched) {
            this.http.get<TaxZone[]>(
              API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(matched.id)
            ).pipe(finalize(() => this.loadingZones = false))
            .subscribe({
              next: (zones) => this.zones = zones.filter(z => !!z.name),
              error: () => this.toast.error('Could not load tax zones.')
            });
          } else {
            this.loadingZones = false;
            this.toast.warning('Could not match district. Please check taxpayer address.');
          }
        },
        error: () => {
          this.loadingZones = false;
          this.toast.error('Could not load districts.');
        }
      });
  }

  onZoneChange(): void {
    this.approveCircle = '';
    this.circles = [];
    const zone = this.zones.find(z => z.name === this.approveZone);
    if (!zone) return;

    this.selectedZoneId = zone.id;
    this.loadingCircles = true;
    this.http.get<TaxCircle[]>(
      API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zone.id)
    ).pipe(finalize(() => this.loadingCircles = false))
    .subscribe({
      next: (circles) => this.circles = circles.filter(c => !!c.name),
      error: () => this.toast.error('Could not load tax circles.')
    });
  }

  // ────────────────────── Actions ──────────────────────

  onApprove(): void {
  if (!this.approveZone || !this.approveCircle) {
    this.toast.warning('Please select Tax Zone and Tax Circle.');
    return;
  }

  this.isProcessing = true;
      const url = `${API_ENDPOINTS.TAXPAYERS.LIST}/${this.taxpayerId}/approve`;

      this.http.put(url, {
        taxZone: this.approveZone,
        taxCircle: this.approveCircle,
        reviewNotes: this.reviewNotes || 'Approved'
      }).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: (data: any) => {
          this.taxpayer = data;
          this.toast.success('Taxpayer approved! TIN has been issued.');
        },
        error: () => this.toast.error('Approval failed. Please try again.')
      });
    }

  onReject(): void {
    if (!this.reviewNotes.trim()) {
      this.toast.warning('Please enter rejection reason.');
      return;
    }

    this.isProcessing = true;
    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}/${this.taxpayerId}/reject`;

    this.http.put(url, {
      reviewNotes: this.reviewNotes
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (data: any) => {
        this.taxpayer = data;
        this.toast.success('Application rejected.');
      },
      error: () => this.toast.error('Rejection failed. Please try again.')
    });
  }

  openSendNotice(): void {
    this.showNoticeModal = true;
  }

  closeSendNotice(): void {
    this.showNoticeModal = false;
    this.noticeSubject = '';
    this.noticeBody = '';
  }

  sendNotice(): void {
    if (!this.noticeSubject.trim() || !this.noticeBody.trim()) {
      this.toast.warning('Subject and message are required.');
      return;
    }

    this.isSendingNotice = true;
    this.http.post(API_ENDPOINTS.NOTICES.CREATE, {
      taxpayerId:  this.taxpayer?.id,
      subject:     this.noticeSubject,
      body:        this.noticeBody,
      noticeType:  this.noticeType,
      priority:    this.noticePriority,
      targetType:  'Specific Taxpayer',
      issuedBy:    this.authService.currentUser?.fullName || 'Officer',
      issuedDate:  new Date().toISOString().split('T')[0],
      dueDate:     null,
      attachmentName: null
    }).pipe(finalize(() => this.isSendingNotice = false))
      .subscribe({
        next: () => {
          this.toast.success('Notice sent successfully!');
          this.closeSendNotice();
        },
        error: () => this.toast.error('Failed to send notice.')
      });
  }
}
