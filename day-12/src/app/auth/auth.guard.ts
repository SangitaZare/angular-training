import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Blocks any route it's attached to unless someone is logged in, sending
 * them to /login (with a returnUrl so they land back where they meant to
 * go) instead.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
