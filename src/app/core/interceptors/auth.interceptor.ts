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
            this.toast.error(
              error.error?.message || 'A record with these details already exists.',
            );
            break;

          case 500:
            this.toast.error('A server error occurred. Please try again later.');
            break;

          default:
            break;
        }

        return throwError(() => error);
      }),
    );
  }
}

