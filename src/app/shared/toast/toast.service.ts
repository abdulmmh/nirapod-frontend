import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       number;
  type:     ToastType;
  title:    string;
  message:  string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private idCounter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private show(type: ToastType, title: string, message: string, duration = 3000): void {
    const toast: Toast = { id: ++this.idCounter, type, title, message, duration };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.remove(toast.id), duration);
  }

  success(message: string, title = 'Success'): void { this.show('success', title, message); }
  error  (message: string, title = 'Error'):   void { this.show('error',   title, message); }
  warning(message: string, title = 'Warning'): void { this.show('warning', title, message); }
  info   (message: string, title = 'Info'):    void { this.show('info',    title, message); }

  remove(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}