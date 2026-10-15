import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { CurrentUser } from './models';
import { decodeJwt, isExpired } from './jwt';

export const TOKEN_KEY = 'day12_auth_token';

/**
 * Owns the one piece of state the rest of the app cares about — who, if
 * anyone, is logged in — and the one piece of storage the interceptor needs:
 * the raw token string. Everything else (decoding, expiry) is derived from
 * that token, never stored separately, so there's exactly one source of
 * truth to go stale. Same shape as Day 9's AuthService, minus the role
 * claim Day 12 has no use for.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _currentUser = signal<CurrentUser | null>(this.restoreFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  getToken(): string | null {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const payload = decodeJwt(token);
    if (!payload || isExpired(payload)) {
      this.logout();
      return null;
    }

    return token;
  }

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http.post<{ token: string }>('/api/auth/login', { username, password }).pipe(
      map(({ token }) => {
        const payload = decodeJwt(token);
        if (!payload) {
          throw new Error('Received an invalid token from the server.');
        }

        sessionStorage.setItem(TOKEN_KEY, token);
        const user: CurrentUser = { username: payload.sub };
        this._currentUser.set(user);
        return user;
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
  }

  private restoreFromStorage(): CurrentUser | null {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const payload = decodeJwt(token);
    if (!payload || isExpired(payload)) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return { username: payload.sub };
  }
}
