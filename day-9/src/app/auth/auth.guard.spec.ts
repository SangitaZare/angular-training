import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { TOKEN_KEY } from './auth.service';
import { createMockJwt } from './jwt';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('allows navigation when the user is logged in', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects to /login with a returnUrl when logged out', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    ) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/login?returnUrl=%2Fadmin');
  });
});
