
import { Subscription } from 'rxjs';
import { Toast, ToastService } from './toast.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls:   ['./toast.component.css'],
})
export class ToastComponent implements OnInit, OnDestroy {

  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      success: 'bi bi-check-lg',
      error:   'bi bi-x-lg',
      warning: 'bi bi-exclamation-lg',
      info:    'bi bi-info-lg'
    };
    return map[type] ?? 'bi bi-info-lg';
  }
}