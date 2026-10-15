import { Injectable, signal } from '@angular/core';

/**
 * Stand-in for a real authentication service — holds a simple logged-in
 * flag in memory (no backend, no persistence) so the route guard has
 * something real to check. `isLoggedIn` is a signal rather than a plain
 * property so the nav bar's login/logout button updates reactively.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly isLoggedIn = signal(false);

  login(): void {
    this.isLoggedIn.set(true);
  }

  logout(): void {
    this.isLoggedIn.set(false);
  }
}
