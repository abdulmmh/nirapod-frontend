import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AppealService } from '../../service/appeal.service';
import { Appeal } from '../../model/appeal.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-appeal-view',
  templateUrl: './appeal-view.component.html',
  styleUrls: ['./appeal-view.component.css'],
})
export class AppealViewComponent implements OnInit {
  appeal: Appeal | null = null;
  isLoading = false;
  appealId = 0;

  showHearingModal = false;
  showDecisionModal = false;
  showWithdrawModal = false;

  hearingSubmitting = false;
  decisionSubmitting = false;
  withdrawSubmitting = false;

  hearingForm!: FormGroup;
  decisionForm!: FormGroup;
  withdrawReason = '';

  // ── Officer dropdown ──────────────────────────────────────────────────────
  officers: { fullName: string; email: string; role: string }[] = [];
  officersLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private appealService: AppealService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.appealId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  buildForms(): void {
    this.hearingForm = this.fb.group({
      hearingDate: ['', Validators.required],
      hearingVenue: ['', Validators.required],
      hearingNotes: [''],
      assignedTo: [''],
    });
    this.decisionForm = this.fb.group({
      decision: ['', Validators.required],
      decisionNotes: [''],
      reliefGranted: [0],
      acceptedAmount: [0],
    });
  }

  load(): void {
    this.isLoading = true;
    this.appealService.getById(this.appealId).subscribe({
      next: (a) => {
        this.appeal = a;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/appeals']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/appeals']);
  }

  // ── Officer list ──────────────────────────────────────────────────────────
  loadOfficers(): void {
    if (this.officers.length > 0) return;
    this.officersLoading = true;
    this.http
      .get<{ fullName: string; email: string; role: string }[]>(
        '/api/users?roles=TAX_OFFICER,SUPERVISOR,TAX_COMMISSIONER',
      )
      .pipe(finalize(() => (this.officersLoading = false)))
      .subscribe({
        next: (u) => {
          this.officers = u ?? [];
        },
        error: () => {
          this.officers = [];
        },
      });
  }

  openHearingModal(): void {
    this.hearingForm.reset({
      hearingDate: '',
      hearingVenue: '',
      hearingNotes: '',
      assignedTo: '',
    });
    this.loadOfficers();
    this.showHearingModal = true;
  }

  // ── Workflow actions ───────────────────────────────────────────────────────
  takeUnderReview(): void {
    this.appealService.takeUnderReview(this.appealId).subscribe({
      next: (a) => {
        this.appeal = a;
      },
    });
  }

  submitHearing(): void {
    if (this.hearingForm.invalid) return;
    this.hearingSubmitting = true;
    this.appealService
      .scheduleHearing(this.appealId, this.hearingForm.value)
      .subscribe({
        next: (a) => {
          this.appeal = a;
          this.hearingSubmitting = false;
          this.showHearingModal = false;
        },
        error: () => {
          this.hearingSubmitting = false;
        },
      });
  }

  submitDecision(): void {
    if (this.decisionForm.invalid) return;
    this.decisionSubmitting = true;
    this.appealService
      .decide(this.appealId, this.decisionForm.value)
      .subscribe({
        next: (a) => {
          this.appeal = a;
          this.decisionSubmitting = false;
          this.showDecisionModal = false;
        },
        error: () => {
          this.decisionSubmitting = false;
        },
      });
  }

  closeAppeal(): void {
    this.appealService
      .close(this.appealId, 'Appeal process completed')
      .subscribe({
        next: (a) => {
          this.appeal = a;
        },
      });
  }

  submitWithdraw(): void {
    this.withdrawSubmitting = true;
    this.appealService.withdraw(this.appealId, this.withdrawReason).subscribe({
      next: (a) => {
        this.appeal = a;
        this.withdrawSubmitting = false;
        this.showWithdrawModal = false;
      },
      error: () => {
        this.withdrawSubmitting = false;
      },
    });
  }

  // ── Permissions ────────────────────────────────────────────────────────────
  canReview(): boolean {
    return this.appeal?.status === 'FILED';
  }
  canScheduleHearing(): boolean {
    return (
      !!this.appeal && ['FILED', 'UNDER_REVIEW'].includes(this.appeal.status)
    );
  }
  canDecide(): boolean {
    return (
      !!this.appeal &&
      ['UNDER_REVIEW', 'HEARING_SCHEDULED'].includes(this.appeal.status) &&
      (this.authService.hasRole(Role.TAX_COMMISSIONER) ||
        this.authService.hasRole(Role.SUPER_ADMIN) ||
        this.authService.hasRole(Role.SUPERVISOR))
    );
  }
  canClose(): boolean {
    return this.appeal?.status === 'DECIDED';
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      FILED: 'badge-info',
      UNDER_REVIEW: 'badge-warning',
      HEARING_SCHEDULED: 'badge-orange',
      DECIDED: 'badge-purple',
      CLOSED: 'badge-muted',
      WITHDRAWN: 'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }
  getStatusLabel(s: string): string {
    return s?.replace(/_/g, ' ') ?? s;
  }
  getDecisionClass(d: string): string {
    return (
      {
        UPHELD: 'badge-success',
        PARTIALLY_UPHELD: 'badge-lime',
        DISMISSED: 'badge-danger',
      }[d] ?? 'badge-secondary'
    );
  }
}
