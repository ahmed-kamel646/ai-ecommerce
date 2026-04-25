import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Strict per-status mapping (Rule 12 of the spec):
 *   401 → log out + redirect to /login
 *   403 → "you don't have permission" notice
 *   404 → propagate (component renders empty/not-found)
 *   409 → surface server message (e.g. stock conflict, optimistic lock)
 *   400 → surface validation message
 *   5xx → generic "something went wrong"
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const serverMessage = (err.error && (err.error.message as string)) || err.message;
      switch (err.status) {
        case 401:
          auth.logout();
          if (!router.url.startsWith('/login')) {
            router.navigate(['/login'], { queryParams: { redirect: router.url } });
          }
          break;
        case 403:
          notify.push('error', 'You do not have permission to perform that action.');
          break;
        case 404:
          // let the calling component decide
          break;
        case 409:
          notify.push('error', serverMessage || 'Conflict — please try again.');
          break;
        case 400:
          notify.push('error', serverMessage || 'Invalid request.');
          break;
        default:
          if (err.status >= 500) {
            notify.push('error', 'Something went wrong. Please try again.');
          }
      }
      return throwError(() => err);
    })
  );
};
