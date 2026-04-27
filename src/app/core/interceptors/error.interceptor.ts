import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * ErrorInterceptor — global HTTP error handler.
 *
 * Responsibility:
 *   • 400 Bad Request  → toast the server message (or a safe fallback).
 *   • 409 Conflict     → toast duplicate/conflict message.
 *   • 5xx / network    → toast a generic server-error message.
 *   • Always rethrows so individual components can react (e.g. stop spinners).
 *
 * NOTE: Components should NOT re-toast 400/409 themselves. They may still
 *       inspect `err.status` to perform UI-only actions (e.g. highlighting a field).
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        switch (err.status) {
          case 400:
            this.toast.error(
              err.error?.message ?? 'Invalid data. Please check your input.',
              'Bad Request',
            );
            break;

          case 409:
            this.toast.error(
              err.error?.message ?? 'A duplicate or conflicting record already exists.',
              'Conflict',
            );
            break;

          case 0:
            // Network error / CORS / server down
            this.toast.error(
              'Cannot reach the server. Check your connection.',
              'Network Error',
            );
            break;

          default:
            if (err.status >= 500) {
              this.toast.error(
                'An unexpected server error occurred. Please try again.',
                `Server Error ${err.status}`,
              );
            }
            // 401 is already handled by AuthInterceptor — no duplicate toast here.
            break;
        }

        return throwError(() => err);
      }),
    );
  }
}
