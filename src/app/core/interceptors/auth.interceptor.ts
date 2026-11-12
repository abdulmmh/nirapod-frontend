import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private injector: Injector,
    private toast : ToastService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('auth_token');

    const api = new URL(API_BASE_URL, window.location.origin);
    const target = new URL(request.url, window.location.origin);
    const isApi = target.origin === api.origin &&
      (target.pathname === api.pathname || target.pathname.startsWith(api.pathname + '/'));
    if (!isApi) return next.handle(request);
    if (token && isApi) {
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
            this.injector.get(AuthService).logout();
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

