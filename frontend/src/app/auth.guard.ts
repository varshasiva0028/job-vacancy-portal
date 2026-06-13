import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = () => {
// Protect routes for authenticated users only
  const authService = inject(AuthService);
  const router = inject(Router);
// If user is logged in, allow access to route
  if (authService.isLoggedIn()) {

    return true;

  }
// If user is not logged in, redirect to login page
  router.navigate(['']);

  return false;

};