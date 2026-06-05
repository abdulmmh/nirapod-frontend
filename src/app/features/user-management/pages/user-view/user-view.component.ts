import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/models/user.model';
import {
  getRoleClass,
  getRoleLabel,
  getStatusClass,
} from 'src/app/shared/helpers/role-display.helper';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css'],
})
export class UserViewComponent implements OnInit, OnDestroy {

  user: User | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private userService: UserService,
    private toast:       ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.userService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user      = user;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || 'User not found.';
          this.toast.error(message);
          this.router.navigate(['/users']);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Delegate to shared helpers — no duplication
  getRoleClass  = getRoleClass;
  getRoleLabel  = getRoleLabel;
  getStatusClass = getStatusClass;

  onEdit(): void {
    this.router.navigate(['/users/edit', this.user?.id]);
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }
}