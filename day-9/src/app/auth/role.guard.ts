import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Role } from './models';

/**
 * Reads the roles allowed on a route from that route's own `data.roles`
 * (see app-routing-module.ts), rather than hard-coding a role per guard
 * function — one guard serves every role-restricted route. Pair with
 * `authGuard` on the same route; this guard only decides *which* logged-in
 * users may proceed, not whether someone is logged in at all.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  if (!allowedRoles || allowedRoles.some((role) => auth.hasRole(role))) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
