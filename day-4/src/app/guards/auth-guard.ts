import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Functional route guard: runs before Angular activates a protected route.
 * Returning true lets the navigation through; returning false cancels it.
 * Here we redirect to /login (carrying the originally-requested URL as a
 * query param) instead of just silently blocking, so the user has a way
 * back in.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
