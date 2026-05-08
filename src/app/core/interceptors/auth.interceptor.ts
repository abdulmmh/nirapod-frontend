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
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Global HTTP Interceptor
 *
 * Handles cross-cutting HTTP error concerns so individual components
 * do not need to duplicate error-handling logic:
 *
 *  401 → clear token, redirect to login
 *  403 → "Access denied" toast
 *  404 → "Not found" toast
 *  409 → Duplicate-record conflict toast (e.g. duplicate VAT return for same BIN + period)
 *  500 → Generic server-error toast
 *
 * Components should only handle errors that require LOCAL context, such as:
 *  - 400 Bad Request (field-level validation with a server message to display inline)
 *
 * Any error not caught here is re-thrown so the component's error callback still fires.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toast : ToastService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('auth_token');

    if (token) {
      // File upload হলে Content-Type set করো না
      // Browser নিজে multipart/form-data set করবে
      const headers: any = {
        Authorization: `Bearer ${token}`
      };

      if (!(request.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      request = request.clone({ setHeaders: headers });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        switch (error.status) {

          case 401:
            localStorage.removeItem('auth_token');
            this.router.navigate(['/auth/login']);
            break;

          case 403:
            this.toast.error('Access denied. You do not have permission to perform this action.');
            break;

          case 404:
            this.toast.error('The requested resource was not found.');
            break;

          case 409:
            // Conflict — most commonly a duplicate VAT return for the same BIN + period.
            // The backend sends a descriptive message in error.error.message.
            this.toast.error(
              error.error?.message || 'A record with these details already exists.',
            );
            break;

          case 500:
            this.toast.error('A server error occurred. Please try again later.');
            break;

          default:
            // Let the component decide what to do for anything else (e.g. 400)
            break;
        }

        // Always re-throw so component-level error callbacks still fire if needed
        return throwError(() => error);
      }),
    );
  }
}

