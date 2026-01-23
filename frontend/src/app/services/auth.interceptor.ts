import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let authReq = req;

  if (token) {
    if (authService['isTokenExpired'](token)) {
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('Token expired'));
    }

    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn("Otrzymano błąd 401 (Unauthorized). Token prawdopodobnie wygasł lub jest nieprawidłowy. Wylogowywanie.");
        
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};