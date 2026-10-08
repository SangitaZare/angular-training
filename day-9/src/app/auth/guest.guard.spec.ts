import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { guestGuard } from './guest.guard';
import { TOKEN_KEY } from './auth.service';
import { createMockJwt } from './jwt';

describe('guestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('allows navigation to /login when logged out', () => {
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects an already-logged-in user to /dashboard', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/dashboard');
  });
});
