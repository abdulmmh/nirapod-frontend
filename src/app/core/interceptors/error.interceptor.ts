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



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toast: ToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) {
          this.toast.error(err.error?.message ?? 'Invalid data. Please check your input.');
        }
        return throwError(() => err);
      }),
    );
  }
}
