import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
// Intercept HTTP requests to add Authorization header with token if available
  const token = localStorage.getItem('token');

  const router = inject(Router);
// If token exists, clone the request and add Authorization header
  if (token) {

    req = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }
// Pass the request to the next handler and catch errors
  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        localStorage.removeItem('token');
        localStorage.removeItem('role');

        router.navigate(['']);

      }

      return throwError(() => error);

    })
    

  );
  

};